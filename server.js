const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");
const compression = require("compression");

const app = express();
const PORT = process.env.PORT || 3000;
const IS_VERCEL = process.env.VERCEL || process.env.NOW_BUILDER;
const DATA_DIR = IS_VERCEL ? path.join("/tmp", "data") : path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const ORIGINAL_DB_FILE = path.join(__dirname, "data", "db.json");
const UPLOADS_DIR = IS_VERCEL ? path.join("/tmp", "uploads") : path.join(__dirname, "public", "uploads");

try { fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } catch (e) {}
try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}

// ==========================================================================
// FILE UPLOAD VALIDATION & SECURITY CONFIGURATION (MAX 5MB)
// ==========================================================================
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"]);
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml"
]);

// Magic byte signature checking for genuine images
function isValidImageBuffer(buffer, originalname = "") {
  if (!buffer || buffer.length < 4) return false;

  // JPEG (FF D8 FF)
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;

  // PNG (89 50 4E 47)
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true;

  // GIF (47 49 46 38)
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return true;

  // WEBP (52 49 46 46 .... 57 45 42 50)
  if (buffer.length >= 12 &&
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
    return true;
  }

  // AVIF (ftypavif at offset 4..11)
  if (buffer.length >= 12) {
    const ftyp = buffer.toString("utf8", 4, 12);
    if (ftyp.includes("avif") || ftyp.includes("mif1")) return true;
  }

  // SVG (XML / SVG text header)
  const head = buffer.toString("utf8", 0, Math.min(buffer.length, 256)).toLowerCase().trim();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) return true;

  return false;
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : ".jpg";
      const randomSuffix = crypto.randomBytes(8).toString("hex");
      cb(null, `img-${Date.now()}-${randomSuffix}${safeExt}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = (file.mimetype || "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(mime)) {
      return cb(new Error("Invalid file format. Only genuine image files (JPEG, PNG, WEBP, GIF, AVIF, SVG) are allowed."), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

function validateUploadedFile(file) {
  if (!file) return true;
  try {
    const buffer = fs.readFileSync(file.path);
    if (!isValidImageBuffer(buffer, file.originalname)) {
      try { fs.unlinkSync(file.path); } catch (e) {}
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

// ==========================================================================
// SECURITY HEADERS & COMPRESSION MIDDLEWARE
// ==========================================================================
app.use(compression());
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-admin-key");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"), {
  maxAge: 0,
  etag: true
}));

// ==========================================================================
// DATABASE UTILITIES & SEEDING
// ==========================================================================
function ensureDb() {
  try { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
  if (!fs.existsSync(DB_FILE)) {
    if (fs.existsSync(ORIGINAL_DB_FILE)) {
      try { fs.copyFileSync(ORIGINAL_DB_FILE, DB_FILE); return; } catch (e) {}
    }
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify({
        tours: seedTours(),
        gallery: seedGallery(),
        destinations: seedDestinations(),
        upcoming: seedUpcoming(),
        bookings: [],
        enquiries: []
      }, null, 2));
    } catch (e) {
      console.error("Failed to seed db.json:", e);
    }
  }
}

function readDb() {
  ensureDb();
  let db = { tours: seedTours(), gallery: seedGallery(), destinations: seedDestinations(), upcoming: seedUpcoming(), bookings: [], enquiries: [] };
  if (fs.existsSync(DB_FILE)) {
    try { db = JSON.parse(fs.readFileSync(DB_FILE, "utf8")); } catch (e) {}
  }
  if (!Array.isArray(db.tours) || db.tours.length === 0) db.tours = seedTours();
  if (!Array.isArray(db.gallery) || db.gallery.length === 0) db.gallery = seedGallery();
  if (!Array.isArray(db.destinations) || db.destinations.length === 0) db.destinations = seedDestinations();
  if (!Array.isArray(db.upcoming) || db.upcoming.length === 0) db.upcoming = seedUpcoming();
  if (!Array.isArray(db.bookings)) db.bookings = [];
  if (!Array.isArray(db.enquiries)) db.enquiries = [];
  return db;
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function seedGallery() {
  return [
    { id: "g-01", place: "Maasai Mara, Kenya", caption: "Big Game & 4x4 Safari Expeditions", category: "safari", tag: "Safari Expedition", image: "/photos/jeep_safari.webp", featured: "wide" },
    { id: "g-02", place: "Savannah Plains", caption: "King of the Jungle in Masai Mara", category: "safari", tag: "Wildlife", image: "/photos/lion.webp" },
    { id: "g-03", place: "Mara River Crossing", caption: "The Great Wildebeest Migration", category: "safari", tag: "Great Migration", image: "/photos/wild_beest.webp" },
    { id: "g-04", place: "Amboseli National Park", caption: "Elephants & Mt Kilimanjaro Views", category: "safari", tag: "Amboseli Elephants", image: "/photos/amboseli.webp" },
    { id: "g-05", place: "Zanzibar Archipelago", caption: "Turquoise Waters & Coral Reefs", category: "beach", tag: "Island Escape", image: "/photos/zanzibar.webp", featured: "tall" },
    { id: "g-06", place: "Malindi Coast", caption: "Golden Sunsets & Tropical Breezes", category: "beach", tag: "Coastal Haven", image: "/photos/malindi.webp" },
    { id: "g-07", place: "Mombasa Island", caption: "Swahili Heritage & Marine Adventures", category: "beach", tag: "Beach Resort", image: "/photos/mombasa.webp" },
    { id: "g-08", place: "Lamu Archipelago", caption: "Traditional Dhow Sailing & Old Town", category: "adventure", tag: "Cultural Heritage", image: "/photos/lamu.webp" },
    { id: "g-09", place: "Kigali & Virunga", caption: "Land of 1,000 Hills & Gorilla Trekking", category: "adventure", tag: "Rwanda Escape", image: "/photos/rwanda.webp" },
    { id: "g-10", place: "Cape Peninsula", caption: "Table Mountain & Atlantic Oceans", category: "adventure", tag: "Cape Town", image: "/photos/capetown.webp" },
    { id: "g-11", place: "Happy Adventurers", caption: "Memorable Group Journeys & Client Stories", category: "clients", tag: "Traveler Stories", image: "/photos/client_1.webp" },
    { id: "g-12", place: "Safari Crew", caption: "Group Joining & Unforgettable Moments", category: "clients", tag: "Safari Crew", image: "/photos/client_2.webp" },
    { id: "g-13", place: "Overland Truck Party", caption: "Road Trips & Celebrations across East Africa", category: "clients", tag: "Truck Party", image: "/photos/client_3.webp" }
  ];
}

function seedTours() {
  return [
    {
      id: "tour-001",
      title: "4 Days Masai Mara & Lake Nakuru Safari",
      slug: "4-days-masai-mara-lake-nakuru",
      destination: "Kenya",
      location: "Masai Mara & Lake Nakuru",
      category: "Safari",
      duration: 4,
      price: 68000,
      groupSize: 7,
      rating: 4.9,
      featured: true,
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1400&q=85",
      shortDescription: "A classic Kenya safari combining the wildlife-rich Masai Mara with Lake Nakuru.",
      description: "Experience spectacular landscapes, big game and unforgettable safari moments on a carefully paced four-day adventure.",
      inclusions: ["Transport in safari vehicle", "Park entry fees", "Professional guide", "Accommodation", "Daily breakfast and dinner"],
      exclusions: ["International flights", "Travel insurance", "Personal expenses", "Tips"],
      itinerary: [
        ["Day 1", "Nairobi to Masai Mara", "Drive through the Great Rift Valley and arrive in the Mara for an afternoon game drive."],
        ["Day 2", "Masai Mara Full Day", "Morning and afternoon game drives searching for the Big Five."],
        ["Day 3", "Masai Mara to Lake Nakuru", "Morning safari followed by a scenic transfer to Lake Nakuru."],
        ["Day 4", "Lake Nakuru to Nairobi", "Morning game drive, breakfast and return to Nairobi."]
      ]
    },
    {
      id: "tour-002",
      title: "3 Days Amboseli National Park Safari",
      slug: "3-days-amboseli-safari",
      destination: "Kenya",
      location: "Amboseli",
      category: "Safari",
      duration: 3,
      price: 48000,
      groupSize: 7,
      rating: 4.8,
      featured: true,
      image: "https://images.unsplash.com/photo-1535338454770-8be927b5a00b?auto=format&fit=crop&w=1400&q=85",
      shortDescription: "Elephants, open plains and iconic views of Mount Kilimanjaro.",
      description: "Discover Amboseli's famous elephant herds and dramatic landscapes on a compact three-day safari.",
      inclusions: ["Safari transport", "Park fees", "Guide", "Accommodation", "Selected meals"],
      exclusions: ["Flights", "Insurance", "Tips", "Personal purchases"],
      itinerary: [
        ["Day 1", "Nairobi to Amboseli", "Travel south and enjoy an afternoon game drive."],
        ["Day 2", "Amboseli Full Day", "Full-day exploration with excellent opportunities for elephant sightings."],
        ["Day 3", "Amboseli to Nairobi", "Final morning drive and return to Nairobi."]
      ]
    },
    {
      id: "tour-003",
      title: "5 Days Kenya Safari Explorer",
      slug: "5-days-kenya-safari-explorer",
      destination: "Kenya",
      location: "Nairobi, Nakuru & Masai Mara",
      category: "Adventure",
      duration: 5,
      price: 85000,
      groupSize: 8,
      rating: 4.9,
      featured: true,
      image: "https://images.unsplash.com/photo-1519659528534-7fd733a832a0?auto=format&fit=crop&w=1400&q=85",
      shortDescription: "A balanced introduction to Kenya's most celebrated safari destinations.",
      description: "A five-day circuit designed for travelers who want wildlife, scenery and a taste of Kenya in one trip.",
      inclusions: ["4x4 safari vehicle", "Park fees", "Guide", "Accommodation", "Selected meals"],
      exclusions: ["Flights", "Visa", "Insurance", "Tips"],
      itinerary: [
        ["Day 1", "Nairobi", "Arrival briefing and city transfer."],
        ["Day 2", "Nairobi to Lake Nakuru", "Rift Valley drive and Lake Nakuru safari."],
        ["Day 3", "Lake Nakuru to Masai Mara", "Scenic transfer and afternoon game drive."],
        ["Day 4", "Masai Mara", "Full day of wildlife exploration."],
        ["Day 5", "Masai Mara to Nairobi", "Final game drive and return."]
      ]
    },
    {
      id: "tour-004",
      title: "6 Days Tanzania Wildlife Escape",
      slug: "6-days-tanzania-wildlife-escape",
      destination: "Tanzania",
      location: "Arusha, Tarangire & Ngorongoro",
      category: "Wildlife",
      duration: 6,
      price: 125000,
      groupSize: 7,
      rating: 5.0,
      featured: false,
      image: "https://images.unsplash.com/photo-1549366021-9f761d450615?auto=format&fit=crop&w=1400&q=85",
      shortDescription: "A Tanzania adventure through iconic wildlife landscapes.",
      description: "Explore northern Tanzania with game drives, crater scenery and memorable wildlife encounters.",
      inclusions: ["4x4 vehicle", "Guide", "Park fees", "Accommodation", "Selected meals"],
      exclusions: ["International flights", "Insurance", "Tips", "Personal expenses"],
      itinerary: [
        ["Day 1", "Arusha", "Arrival and orientation."],
        ["Day 2", "Tarangire", "Full day wildlife experience."],
        ["Day 3", "Karatu", "Scenic transfer and cultural experience."],
        ["Day 4", "Ngorongoro", "Crater exploration."],
        ["Day 5", "Lake Manyara", "Game drive and local landscapes."],
        ["Day 6", "Departure", "Transfer to airport."]
      ]
    }
  ];
}

function seedDestinations() {
  return [
    { id: "dest-mara", name: "Maasai Mara", slug: "maasai-mara", image: "/photos/lion.webp", description: "World-famous Great Migration & Big Five game drives.", showInSearch: true },
    { id: "dest-zanzibar", name: "Zanzibar", slug: "zanzibar", image: "/photos/zanzibar.webp", description: "White sand beaches, Stone Town culture & dhow cruises.", showInSearch: true },
    { id: "dest-amboseli", name: "Amboseli", slug: "amboseli", image: "/photos/amboseli.webp", description: "Majestic elephant herds under snow-capped Mt Kilimanjaro.", showInSearch: true },
    { id: "dest-serengeti", name: "Serengeti", slug: "serengeti", image: "/photos/jeep_safari.webp", description: "Endless savannah plains & legendary predator encounters.", showInSearch: true },
    { id: "dest-rift", name: "Great Rift Valley", slug: "rift-valley", image: "/photos/client_3.webp", description: "Geysers, flamingos & volcanic crater adventures.", showInSearch: true },
    { id: "dest-mombasa", name: "Mombasa", slug: "mombasa", image: "/photos/mombasa.webp", description: "Coastal beach paradise and Swahili heritage.", showInSearch: true },
    { id: "dest-malindi", name: "Malindi", slug: "malindi", image: "/photos/watamu_1.jpg", description: "Tropical marine parks and golden sand shores.", showInSearch: true },
    { id: "dest-diani", name: "Diani", slug: "diani", image: "/photos/diani_1.jpg", description: "World-renowned white sand beaches and reef diving.", showInSearch: true },
    { id: "dest-tsavo", name: "Tsavo", slug: "tsavo", image: "/photos/tsavo_1.jpg", description: "Red elephant herds and vast rugged wilderness.", showInSearch: true },
    { id: "dest-sagana", name: "Sagana", slug: "sagana", image: "/photos/sagana_1.avif", description: "White water rafting and outdoor adrenaline adventures.", showInSearch: true },
    { id: "dest-lamu", name: "Lamu", slug: "lamu", image: "/photos/watamu_1.jpg", description: "Unspoiled UNESCO Swahili island and dhow sailing.", showInSearch: true },
    { id: "dest-capetown", name: "Cape Town", slug: "cape-town", image: "/photos/capetown.webp", description: "Table Mountain, coastal peninsulas, and winelands.", showInSearch: true },
    { id: "dest-rwanda", name: "Rwanda", slug: "rwanda", image: "/packages/rwanda.webp", description: "Gorilla trekking in Volcanoes National Park.", showInSearch: true }
  ];
}

function seedUpcoming() {
  return [
    {
      id: "up-fally",
      title: "Lakes Baringo & Bogoria",
      subtitle: "Overland Truck party adventure",
      location: "Lake Baringo & Bogoria",
      date: "From 05th Sep, 2026",
      price: 45000,
      category: "Overland Truck Party",
      image: "/packages/lake_Bogoria.webp",
      description: "Discover the stunning landscapes of Lake Baringo and Lake Bogoria on this adventure-filled tour."
    },
    {
      id: "up-strathmore",
      title: "Rwanda Cultural Safari",
      subtitle: "Get a chance to visit the diverse Rwandan culture",
      location: "Rwanda",
      date: "From 05th Sep, 2026",
      price: 25000,
      category: "Culture",
      image: "/packages/rwanda.webp",
      description: "Participate in the Strathmore University Foundation Annual Run followed by a guided Great Rift Valley Naivasha excursion."
    },
    {
      id: "up-mara",
      title: "WILDEBEEST MIGRATION",
      subtitle: "Prime season river crossing & Big Five wildlife viewing",
      location: "Maasai Mara",
      date: "From 1st July to 1st October 2026",
      price: 68000,
      category: "Wildlife Safari",
      image: "/packages/wildbeest.webp",
      description: "Witness millions of wildebeest braving the Mara River on this exclusive luxury safari expedition."
    },
    {
      id: "up-cape",
      title: "CAPE TOWN STAYCATION",
      subtitle: "Full day Peninsular Tour",
      location: "Cape Town",
      date: "From 12th to 14th December, 2026",
      price: 68000,
      category: "Safari",
      image: "/packages/capetown.webp",
      description: "Explore the stunning beauty of Cape Town with our full-day peninsular tour. Experience the iconic Table Mountain, Cape Point, and the charming coastal towns along the way."
    },
    {
      id: "up-zanzibar",
      title: "ZANZIBAR CULTURAL & OCEAN BEACH GETAWAY",
      subtitle: "Tropical white sand beaches, Stone Town & Dhow sailing",
      location: "Zanzibar",
      date: "From 14th to 18th October 2026",
      price: 85000,
      category: "Beach & Culture",
      image: "/packages/zanzibar.webp",
      description: "Relax on Zanzibar's turquoise coast with sunset dhow cruises and authentic Swahili spice tours."
    }
  ];
}

// ==========================================================================
// PUBLIC API ENDPOINTS
// ==========================================================================
app.get("/api/tours", (req, res) => {
  const { destination, category, duration, maxPrice, featured, search } = req.query;
  let tours = readDb().tours;

  if (destination && destination !== "All destinations") {
    const d = destination.toLowerCase().trim();
    tours = tours.filter(t => {
      const dest = (t.destination || "").toLowerCase();
      const loc = (t.location || "").toLowerCase();
      const title = (t.title || "").toLowerCase();
      return dest.includes(d) || loc.includes(d) || title.includes(d) || d.includes(dest) || d.includes(loc);
    });
  }

  if (category && category !== "All types") {
    const c = category.toLowerCase().trim();
    tours = tours.filter(t => {
      const cat = (t.category || "").toLowerCase();
      const title = (t.title || "").toLowerCase();
      const desc = (t.shortDescription || t.description || "").toLowerCase();
      return cat.includes(c) || c.includes(cat) || title.includes(c) || desc.includes(c) ||
        (c.includes("safari") && (cat.includes("safari") || cat.includes("wildlife"))) ||
        (c.includes("beach") && (cat.includes("beach") || cat.includes("coastal") || cat.includes("marine") || cat.includes("island"))) ||
        (c.includes("culture") && (cat.includes("culture") || cat.includes("island") || cat.includes("heritage"))) ||
        (c.includes("adventure") && (cat.includes("adventure") || cat.includes("overland") || cat.includes("safari"))) ||
        (c.includes("overland") && (cat.includes("overland") || cat.includes("truck") || cat.includes("adventure"))) ||
        (c.includes("wildlife") && (cat.includes("wildlife") || cat.includes("safari")));
    });
  }

  if (duration && duration !== "Any duration") {
    const durNum = Number(duration);
    if (!isNaN(durNum)) {
      tours = tours.filter(t => {
        const d = Number(t.duration) || 0;
        return durNum >= 5 ? d >= 5 : d === durNum;
      });
    }
  }

  if (maxPrice) tours = tours.filter(t => Number(t.price) <= Number(maxPrice));
  if (featured === "true") tours = tours.filter(t => t.featured);
  if (search) {
    const q = search.toLowerCase().trim();
    tours = tours.filter(t => `${t.title} ${t.location} ${t.destination} ${t.category} ${t.shortDescription} ${t.description}`.toLowerCase().includes(q));
  }

  res.json(tours);
});

app.get("/api/destinations", (req, res) => {
  res.json(readDb().destinations);
});

app.get("/api/tours/:slug", (req, res) => {
  const tour = readDb().tours.find(t => t.slug === req.params.slug || t.id === req.params.slug);
  if (!tour) return res.status(404).json({ error: "Tour not found" });
  res.json(tour);
});

app.get("/api/gallery", (req, res) => res.json(readDb().gallery));
app.get("/api/upcoming", (req, res) => res.json(readDb().upcoming));

app.post("/api/bookings", (req, res) => {
  const db = readDb();
  const booking = {
    id: "BK-" + Date.now(),
    createdAt: new Date().toISOString(),
    status: "Pending",
    ...req.body
  };
  db.bookings.push(booking);
  writeDb(db);
  res.status(201).json({ message: "Booking enquiry received", booking });
});

app.post("/api/enquiries", (req, res) => {
  const db = readDb();
  const enquiry = {
    id: "ENQ-" + Date.now(),
    createdAt: new Date().toISOString(),
    status: "New",
    ...req.body
  };
  db.enquiries.push(enquiry);
  writeDb(db);
  res.status(201).json({ message: "Message received", enquiry });
});

// ==========================================================================
// SECURE ADMIN AUTHENTICATION & PASSWORD HASHING (SCRYPT + TIMING SAFE)
// ==========================================================================
const failedLoginAttempts = new Map();

function checkLoginRateLimit(ip) {
  const now = Date.now();
  const record = failedLoginAttempts.get(ip);
  if (!record) return true;
  if (record.count >= 5 && now - record.lastAttempt < 15 * 60 * 1000) {
    return false;
  }
  if (now - record.lastAttempt >= 15 * 60 * 1000) {
    failedLoginAttempts.delete(ip);
    return true;
  }
  return true;
}

function recordFailedLogin(ip) {
  const now = Date.now();
  const record = failedLoginAttempts.get(ip) || { count: 0, lastAttempt: now };
  record.count += 1;
  record.lastAttempt = now;
  failedLoginAttempts.set(ip, record);
}

function resetFailedLogin(ip) {
  failedLoginAttempts.delete(ip);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

function verifyPassword(password, storedHashOrPlain) {
  if (!password || !storedHashOrPlain) return false;
  
  if (typeof storedHashOrPlain === "string" && storedHashOrPlain.includes(":")) {
    const parts = storedHashOrPlain.split(":");
    if (parts.length === 2) {
      const [salt, key] = parts;
      try {
        const derivedKey = crypto.scryptSync(password, salt, 64);
        const keyBuffer = Buffer.from(key, "hex");
        if (derivedKey.length === keyBuffer.length && crypto.timingSafeEqual(derivedKey, keyBuffer)) {
          return true;
        }
      } catch (e) {}
    }
  }
  
  // Fallback check for plain string (with constant-time safe comparison)
  const a = Buffer.from(String(password));
  const b = Buffer.from(String(storedHashOrPlain));
  if (a.length === b.length && crypto.timingSafeEqual(a, b)) {
    return true;
  }
  return false;
}

function getStoredAdminKey() {
  const db = readDb();
  return db.adminKey || process.env.ADMIN_KEY || "admin123";
}

function adminAuth(req, res, next) {
  const clientIp = req.ip || req.connection.remoteAddress || "unknown";
  if (!checkLoginRateLimit(clientIp)) {
    return res.status(429).json({ error: "Too many failed sign-in attempts. Please try again in 15 minutes." });
  }

  const key = req.headers["x-admin-key"];
  const storedKey = getStoredAdminKey();

  if (!key || !verifyPassword(key, storedKey)) {
    recordFailedLogin(clientIp);
    return res.status(401).json({ error: "Unauthorized access: Invalid admin key." });
  }

  resetFailedLogin(clientIp);
  next();
}

app.post("/api/admin/change-password", adminAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const storedKey = getStoredAdminKey();

  if (!currentPassword || !verifyPassword(currentPassword, storedKey)) {
    return res.status(400).json({ error: "Current password is incorrect." });
  }

  if (!newPassword || newPassword.trim().length < 6) {
    return res.status(400).json({ error: "New password must be at least 6 characters long." });
  }

  const db = readDb();
  db.adminKey = hashPassword(newPassword.trim());
  writeDb(db);

  res.json({ message: "Password updated successfully and encrypted with scrypt." });
});

app.get("/api/admin/stats", adminAuth, (req, res) => {
  const db = readDb();
  res.json({
    tours: (db.tours || []).length,
    destinations: (db.destinations || []).length,
    upcoming: (db.upcoming || []).length,
    gallery: (db.gallery || []).length,
    featured: (db.tours || []).filter(t => t.featured).length
  });
});

app.get("/api/admin/gallery", adminAuth, (req, res) => res.json(readDb().gallery));
app.get("/api/admin/destinations", adminAuth, (req, res) => res.json(readDb().destinations));
app.get("/api/admin/upcoming", adminAuth, (req, res) => res.json(readDb().upcoming));

// ==========================================================================
// ADMIN MUTATION ROUTES WITH VALIDATED IMAGE UPLOADS
// ==========================================================================
app.post("/api/admin/upcoming", adminAuth, upload.single("image"), (req, res) => {
  if (req.file && !validateUploadedFile(req.file)) {
    return res.status(400).json({ error: "Uploaded file is corrupted or not a valid image format." });
  }

  const db = readDb();
  const item = {
    id: "up-" + Date.now(),
    title: req.body.title || "",
    subtitle: req.body.subtitle || "",
    location: req.body.location || "",
    date: req.body.date || "",
    price: Number(req.body.price) || 0,
    category: req.body.category || "Safari",
    image: req.file ? "/uploads/" + req.file.filename : (req.body.imageUrl || req.body.image || "/packages/lake_Bogoria.webp"),
    description: req.body.description || ""
  };
  if (!item.title) return res.status(400).json({ error: "Title is required" });
  db.upcoming.push(item);
  writeDb(db);
  res.status(201).json(item);
});

app.put("/api/admin/upcoming/:id", adminAuth, upload.single("image"), (req, res) => {
  if (req.file && !validateUploadedFile(req.file)) {
    return res.status(400).json({ error: "Uploaded file is corrupted or not a valid image format." });
  }

  const db = readDb();
  const item = db.upcoming.find(u => u.id === req.params.id);
  if (!item) return res.status(404).json({ error: "Upcoming tour/event not found" });

  item.title = req.body.title !== undefined ? req.body.title : item.title;
  item.subtitle = req.body.subtitle !== undefined ? req.body.subtitle : item.subtitle;
  item.location = req.body.location !== undefined ? req.body.location : item.location;
  item.date = req.body.date !== undefined ? req.body.date : item.date;
  if (req.body.price !== undefined) item.price = Number(req.body.price) || 0;
  item.category = req.body.category !== undefined ? req.body.category : item.category;
  if (req.file) item.image = "/uploads/" + req.file.filename;
  else if (req.body.imageUrl || req.body.image) item.image = req.body.imageUrl || req.body.image;
  item.description = req.body.description !== undefined ? req.body.description : item.description;

  writeDb(db);
  res.json(item);
});

app.delete("/api/admin/upcoming/:id", adminAuth, (req, res) => {
  const db = readDb();
  const item = db.upcoming.find(u => u.id === req.params.id);
  if (item?.image?.startsWith("/uploads/")) {
    const file = path.join(__dirname, "public", item.image.slice("/uploads/".length));
    if (file.startsWith(UPLOADS_DIR + path.sep) && fs.existsSync(file)) {
      try { fs.unlinkSync(file); } catch (e) {}
    }
  }
  db.upcoming = db.upcoming.filter(u => u.id !== req.params.id);
  writeDb(db);
  res.json({ message: "Upcoming tour/event deleted" });
});

app.post("/api/admin/destinations", adminAuth, upload.single("image"), (req, res) => {
  if (req.file && !validateUploadedFile(req.file)) {
    return res.status(400).json({ error: "Uploaded file is corrupted or not a valid image format." });
  }

  const db = readDb();
  const showInSearch = req.body.showInSearch === "false" || req.body.showInSearch === false ? false : true;
  const dest = {
    id: "dest-" + Date.now(),
    name: req.body.name,
    slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-'),
    image: req.file ? "/uploads/" + req.file.filename : req.body.imageUrl || req.body.image || "/photos/zanzibar.jpg",
    description: req.body.description || "",
    showInSearch: showInSearch
  };
  if (!dest.name) return res.status(400).json({ error: "Destination name is required" });
  db.destinations.push(dest);
  writeDb(db);
  res.status(201).json(dest);
});

app.put("/api/admin/destinations/:id", adminAuth, upload.single("image"), (req, res) => {
  if (req.file && !validateUploadedFile(req.file)) {
    return res.status(400).json({ error: "Uploaded file is corrupted or not a valid image format." });
  }

  const db = readDb();
  const dest = db.destinations.find(d => d.id === req.params.id);
  if (!dest) return res.status(404).json({ error: "Destination not found" });

  dest.name = req.body.name !== undefined ? req.body.name : dest.name;
  dest.slug = req.body.slug !== undefined ? req.body.slug : dest.slug;
  if (req.file) dest.image = "/uploads/" + req.file.filename;
  else if (req.body.imageUrl || req.body.image) dest.image = req.body.imageUrl || req.body.image;
  if (req.body.description !== undefined) dest.description = req.body.description;
  if (req.body.showInSearch !== undefined) {
    dest.showInSearch = req.body.showInSearch === "true" || req.body.showInSearch === true;
  }

  writeDb(db);
  res.json(dest);
});

app.patch("/api/admin/destinations/:id/toggle-search", adminAuth, (req, res) => {
  const db = readDb();
  const dest = db.destinations.find(d => d.id === req.params.id);
  if (!dest) return res.status(404).json({ error: "Destination not found" });

  dest.showInSearch = dest.showInSearch === false ? true : false;
  writeDb(db);
  res.json({ message: "Search status updated", dest });
});

app.delete("/api/admin/destinations/:id", adminAuth, (req, res) => {
  const db = readDb();
  db.destinations = db.destinations.filter(d => d.id !== req.params.id);
  writeDb(db);
  res.json({ message: "Destination deleted" });
});

app.post("/api/admin/gallery", adminAuth, upload.single("image"), (req, res) => {
  if (req.file && !validateUploadedFile(req.file)) {
    return res.status(400).json({ error: "Uploaded file is corrupted or not a valid image format." });
  }

  const db = readDb();
  const image = {
    id: "gallery-" + Date.now(),
    place: req.body.place,
    caption: req.body.caption || "",
    image: req.file ? "/uploads/" + req.file.filename : req.body.imageUrl || req.body.image
  };
  if (!image.image || !image.place) return res.status(400).json({ error: "Place and image are required" });
  db.gallery.push(image);
  writeDb(db);
  res.status(201).json(image);
});

app.put("/api/admin/gallery/:id", adminAuth, (req, res) => {
  const db = readDb();
  const image = db.gallery.find(item => item.id === req.params.id);
  if (!image) return res.status(404).json({ error: "Gallery image not found" });
  image.caption = req.body.caption || "";
  writeDb(db);
  res.json(image);
});

app.delete("/api/admin/gallery/:id", adminAuth, (req, res) => {
  const db = readDb();
  const image = db.gallery.find(item => item.id === req.params.id);
  if (image?.image?.startsWith("/uploads/")) {
    const file = path.join(__dirname, "public", image.image.slice("/uploads/".length));
    if (file.startsWith(UPLOADS_DIR + path.sep) && fs.existsSync(file)) fs.unlinkSync(file);
  }
  db.gallery = db.gallery.filter(image => image.id !== req.params.id);
  writeDb(db);
  res.json({ message: "Gallery image deleted" });
});

app.post("/api/admin/tours", adminAuth, upload.single("imageFile"), (req, res) => {
  if (req.file && !validateUploadedFile(req.file)) {
    return res.status(400).json({ error: "Uploaded file is corrupted or not a valid image format." });
  }

  const db = readDb();
  const tourImage = req.file ? "/uploads/" + req.file.filename : (req.body.image || req.body.imageUrl || "/photos/wild_beest.jpg");
  const tour = {
    id: "tour-" + Date.now(),
    title: req.body.title,
    slug: req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    destination: req.body.destination || "Kenya",
    location: req.body.location || req.body.destination || "Kenya",
    category: req.body.category || "Safari",
    duration: Number(req.body.duration) || 3,
    price: Number(req.body.price) || 65000,
    groupSize: Number(req.body.groupSize) || 7,
    rating: 5,
    featured: req.body.featured === "true" || req.body.featured === true,
    image: tourImage,
    shortDescription: req.body.shortDescription || "",
    description: req.body.description || "",
    inclusions: Array.isArray(req.body.inclusions) ? req.body.inclusions : [],
    exclusions: Array.isArray(req.body.exclusions) ? req.body.exclusions : [],
    itinerary: []
  };
  if (!tour.title || !tour.price) {
    return res.status(400).json({ error: "title and price are required" });
  }
  db.tours.push(tour);
  writeDb(db);
  res.status(201).json(tour);
});

app.put("/api/admin/tours/:id", adminAuth, upload.single("imageFile"), (req, res) => {
  if (req.file && !validateUploadedFile(req.file)) {
    return res.status(400).json({ error: "Uploaded file is corrupted or not a valid image format." });
  }

  const db = readDb();
  const index = db.tours.findIndex(t => t.id === req.params.id);
  if (index < 0) return res.status(404).json({ error: "Tour not found" });
  
  const existing = db.tours[index];
  const tourImage = req.file ? "/uploads/" + req.file.filename : (req.body.image || req.body.imageUrl || existing.image);
  
  db.tours[index] = {
    ...existing,
    ...req.body,
    duration: req.body.duration ? Number(req.body.duration) : existing.duration,
    price: req.body.price ? Number(req.body.price) : existing.price,
    featured: req.body.featured === "true" || req.body.featured === true,
    image: tourImage
  };
  writeDb(db);
  res.json(db.tours[index]);
});

app.delete("/api/admin/tours/:id", adminAuth, (req, res) => {
  const db = readDb();
  db.tours = db.tours.filter(t => t.id !== req.params.id);
  writeDb(db);
  res.json({ message: "Tour deleted" });
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Multer & general error handler
app.use((err, req, res, next) => {
  if (err && err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "Image size exceeds 5MB limit. Please upload an image under 5MB." });
  }
  if (err) {
    return res.status(400).json({ error: err.message || "An unexpected error occurred." });
  }
  next();
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Supreme Adventures server running on port ${PORT}`));
}

module.exports = app;
