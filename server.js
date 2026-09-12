const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");
const compression = require("compression");
const supabase = require("./api/supabaseClient");
const { uploadToStorage, deleteFromStorage, isConfigured: storageReady } = require("./api/supabaseStorage");

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// LOCAL JSON FALLBACK — used only when Supabase is unavailable (local dev)
// ---------------------------------------------------------------------------
const DATA_DIR = path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const UPLOADS_DIR = path.join(__dirname, "public", "uploads");
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

// ---------------------------------------------------------------------------
// Multer: use MEMORY storage so buffers go to Supabase Storage, not to disk
// Falls back to disk storage only when Supabase Storage is not configured
// ---------------------------------------------------------------------------
const storage = storageReady
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, UPLOADS_DIR),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : ".jpg";
        const randomSuffix = crypto.randomBytes(8).toString("hex");
        cb(null, `img-${Date.now()}-${randomSuffix}${safeExt}`);
      }
    });

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = (file.mimetype || "").toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(mime)) {
      return cb(new Error("Invalid file format. Only genuine image files (JPEG, PNG, WEBP, GIF, AVIF, SVG) are allowed."), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

const uploadImage = upload.fields([
  { name: "image", maxCount: 1 },
  { name: "imageFile", maxCount: 1 },
  { name: "file", maxCount: 1 }
]);

function getUploadedFile(req) {
  if (req.file) return req.file;
  if (req.files) {
    if (req.files.image && req.files.image[0]) return req.files.image[0];
    if (req.files.imageFile && req.files.imageFile[0]) return req.files.imageFile[0];
    if (req.files.file && req.files.file[0]) return req.files.file[0];
  }
  return null;
}

function validateUploadedFile(file) {
  if (!file) return true;
  // For memory storage, buffer is on file.buffer; for disk storage, read from file.path
  const buffer = file.buffer || (file.path ? fs.readFileSync(file.path) : null);
  if (!buffer) return false;
  if (!isValidImageBuffer(buffer, file.originalname)) {
    // Clean up disk file if it exists
    if (file.path) { try { fs.unlinkSync(file.path); } catch (e) {} }
    return false;
  }
  return true;
}

/**
 * Upload an image file (from multer) — returns a persistent URL.
 * Uses Supabase Storage when configured, falls back to local /uploads/ path.
 */
async function handleImageUpload(file, folder = "images") {
  if (!file) return null;

  if (storageReady && file.buffer) {
    return await uploadToStorage(file.buffer, folder, file.originalname);
  }

  // Fallback: file was saved to disk by multer diskStorage
  if (file.filename) {
    return "/uploads/" + file.filename;
  }

  return null;
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
// LOCAL JSON FALLBACK — only used when Supabase is unavailable
// ==========================================================================
function readLocalDb() {
  try { if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}
  let db = { tours: [], gallery: [], destinations: [], upcoming: [], bookings: [], enquiries: [] };
  if (fs.existsSync(DB_FILE)) {
    try { db = JSON.parse(fs.readFileSync(DB_FILE, "utf8")); } catch (e) {}
  }
  let modified = false;
  if (!Array.isArray(db.tours)) { db.tours = []; modified = true; }
  if (!Array.isArray(db.gallery)) { db.gallery = []; modified = true; }
  if (!Array.isArray(db.destinations)) { db.destinations = []; modified = true; }
  if (!Array.isArray(db.upcoming)) { db.upcoming = []; modified = true; }
  if (!Array.isArray(db.bookings)) { db.bookings = []; modified = true; }
  if (!Array.isArray(db.enquiries)) { db.enquiries = []; modified = true; }

  // Auto-seed default data if arrays are empty so local fallback is never blank
  if (db.upcoming.length === 0 && typeof seedUpcoming === "function") {
    db.upcoming = seedUpcoming();
    modified = true;
  }
  if (db.destinations.length === 0 && typeof seedDestinations === "function") {
    db.destinations = seedDestinations();
    modified = true;
  }
  if (db.gallery.length === 0 && typeof seedGallery === "function") {
    db.gallery = seedGallery();
    modified = true;
  }
  if (db.tours.length === 0 && typeof seedTours === "function") {
    db.tours = seedTours();
    modified = true;
  }
  if (modified) {
    writeLocalDb(db);
  }
  return db;
}

function writeLocalDb(db) {
  try { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); } catch (e) {
    console.error("Failed to write local db.json:", e.message);
  }
}

// ==========================================================================
// SEED DATA — used for initial database migration only
// ==========================================================================
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
    { id: "g-13", place: "Overland Truck Party", caption: "Road Trips & Celebrations across East Africa & Worldwide", category: "clients", tag: "Truck Party", image: "/photos/client_3.webp" }
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
    { id: "dest-malindi", name: "Malindi", slug: "malindi", image: "/photos/malindi.webp", description: "Tropical marine parks and golden sand shores.", showInSearch: true },
    { id: "dest-diani", name: "Diani", slug: "diani", image: "/photos/diani_1.jpg", description: "World-renowned white sand beaches and reef diving.", showInSearch: true },
    { id: "dest-tsavo", name: "Tsavo", slug: "tsavo", image: "/photos/tsavo_1.jpg", description: "Red elephant herds and vast rugged wilderness.", showInSearch: true },
    { id: "dest-sagana", name: "Sagana", slug: "sagana", image: "/photos/sagana_1.avif", description: "White water rafting and outdoor adrenaline adventures.", showInSearch: true },
    { id: "dest-lamu", name: "Lamu", slug: "lamu", image: "/photos/lamu.webp", description: "Unspoiled UNESCO Swahili island and dhow sailing.", showInSearch: true },
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
// SUPABASE ↔ CAMELCASE HELPERS
// ==========================================================================
// Supabase columns use snake_case; the frontend/API expects camelCase.
function tourFromRow(r) {
  return {
    id: r.id,
    title: r.title,
    slug: r.slug,
    destination: r.destination,
    location: r.location,
    category: r.category,
    duration: r.duration,
    price: Number(r.price),
    groupSize: r.group_size,
    rating: Number(r.rating),
    featured: r.featured,
    image: r.image,
    shortDescription: r.short_description,
    description: r.description,
    inclusions: r.inclusions || [],
    exclusions: r.exclusions || [],
    itinerary: r.itinerary || []
  };
}

function destFromRow(r) {
  return {
    id: r.id,
    name: r.name,
    slug: r.slug,
    image: r.image,
    description: r.description,
    showInSearch: r.show_in_search !== false
  };
}

// Gallery and upcoming columns match camelCase already (single-word keys),
// so they pass through unchanged.

// ==========================================================================
// PUBLIC API ENDPOINTS
// ==========================================================================
app.get("/api/health", async (req, res) => {
  const isSupabaseConfigured = !!supabase;
  let supabaseStatus = "disconnected";
  let counts = {};

  if (supabase) {
    try {
      const [t, u, d, g] = await Promise.all([
        supabase.from("tours").select("id", { count: "exact", head: true }),
        supabase.from("upcoming").select("id", { count: "exact", head: true }),
        supabase.from("destinations").select("id", { count: "exact", head: true }),
        supabase.from("gallery").select("id", { count: "exact", head: true })
      ]);
      supabaseStatus = "connected";
      counts = {
        tours: t.count || 0,
        upcoming: u.count || 0,
        destinations: d.count || 0,
        gallery: g.count || 0
      };
    } catch (e) {
      supabaseStatus = "error: " + e.message;
    }
  } else {
    const db = readLocalDb();
    counts = {
      tours: (db.tours || []).length,
      upcoming: (db.upcoming || []).length,
      destinations: (db.destinations || []).length,
      gallery: (db.gallery || []).length
    };
  }

  res.json({
    status: "ok",
    database: isSupabaseConfigured ? "supabase" : "local_json_ephemeral",
    supabaseStatus,
    counts
  });
});

// ==========================================================================
// IN-MEMORY CACHE LAYER
// Keeps public endpoints blazing fast (<1ms) and saves Supabase DB egress.
// Revalidates automatically after TTL or immediately upon any Admin mutation.
// ==========================================================================
const memoryCache = {
  tours: { data: null, timestamp: 0 },
  destinations: { data: null, timestamp: 0 },
  gallery: { data: null, timestamp: 0 },
  upcoming: { data: null, timestamp: 0 },
  TTL: 10 * 60 * 1000 // 10 minutes cache TTL
};

function invalidateCache(key) {
  if (key && memoryCache[key]) {
    memoryCache[key].data = null;
    memoryCache[key].timestamp = 0;
  } else {
    Object.keys(memoryCache).forEach(k => {
      if (k !== "TTL") {
        memoryCache[k].data = null;
        memoryCache[k].timestamp = 0;
      }
    });
  }
}

async function getCached(key, fetcher) {
  const now = Date.now();
  const cached = memoryCache[key];
  if (cached && cached.data && (now - cached.timestamp < memoryCache.TTL)) {
    return cached.data;
  }
  const freshData = await fetcher();
  if (cached) {
    cached.data = freshData;
    cached.timestamp = now;
  }
  return freshData;
}

// Helper to fetch full raw tours list
async function fetchAllTours() {
  if (supabase) {
    const { data, error } = await supabase.from("tours").select("*");
    if (error) throw error;
    return (data || []).map(tourFromRow);
  }
  return readLocalDb().tours || [];
}

// Helper to fetch destinations
async function fetchAllDestinations() {
  if (supabase) {
    const { data, error } = await supabase.from("destinations").select("*");
    if (error) throw error;
    return (data || []).map(destFromRow);
  }
  return readLocalDb().destinations || [];
}

// Helper to fetch gallery
async function fetchAllGallery() {
  if (supabase) {
    const { data, error } = await supabase.from("gallery").select("*");
    if (error) throw error;
    return data || [];
  }
  return readLocalDb().gallery || [];
}

// Helper to fetch upcoming
async function fetchAllUpcoming() {
  if (supabase) {
    const { data, error } = await supabase.from("upcoming").select("*");
    if (error) throw error;
    return data || [];
  }
  return readLocalDb().upcoming || [];
}

app.get("/api/tours", async (req, res) => {
  try {
    const { destination, category, duration, maxPrice, featured, search } = req.query;

    // Retrieve from in-memory cache
    const allTours = await getCached("tours", fetchAllTours);
    let tours = [...allTours];

    if (featured === "true") {
      tours = tours.filter(t => t.featured);
    }

    if (maxPrice) {
      tours = tours.filter(t => Number(t.price) <= Number(maxPrice));
    }

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

    if (search) {
      const q = search.toLowerCase().trim();
      tours = tours.filter(t => `${t.title} ${t.location} ${t.destination} ${t.category} ${t.shortDescription} ${t.description}`.toLowerCase().includes(q));
    }

    // Edge & browser cache headers: 60s max-age with 5 min stale-while-revalidate
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    return res.json(tours);
  } catch (err) {
    console.error("GET /api/tours error:", err.message);
    res.status(500).json({ error: "Failed to fetch tours" });
  }
});

app.get("/api/destinations", async (req, res) => {
  try {
    const destinations = await getCached("destinations", fetchAllDestinations);
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json(destinations);
  } catch (err) {
    console.error("GET /api/destinations error:", err.message);
    res.status(500).json({ error: "Failed to fetch destinations" });
  }
});

app.get("/api/tours/:slug", async (req, res) => {
  try {
    const target = req.params.slug;
    // Check in cached tours first
    const allTours = await getCached("tours", fetchAllTours);
    let tour = allTours.find(t => t.slug === target || t.id === target);

    if (!tour && supabase) {
      // If not in cache, fallback to direct query in case of fresh direct ID lookup
      let { data, error } = await supabase.from("tours").select("*").eq("slug", target).maybeSingle();
      if (!data) {
        ({ data, error } = await supabase.from("tours").select("*").eq("id", target).maybeSingle());
      }
      if (error) throw error;
      if (data) tour = tourFromRow(data);
    }

    if (!tour) return res.status(404).json({ error: "Tour not found" });

    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json(tour);
  } catch (err) {
    console.error("GET /api/tours/:slug error:", err.message);
    res.status(500).json({ error: "Failed to fetch tour" });
  }
});

app.get("/api/gallery", async (req, res) => {
  try {
    const gallery = await getCached("gallery", fetchAllGallery);
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json(gallery);
  } catch (err) {
    console.error("GET /api/gallery error:", err.message);
    res.status(500).json({ error: "Failed to fetch gallery" });
  }
});

app.get("/api/upcoming", async (req, res) => {
  try {
    const upcoming = await getCached("upcoming", fetchAllUpcoming);
    res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json(upcoming);
  } catch (err) {
    console.error("GET /api/upcoming error:", err.message);
    res.status(500).json({ error: "Failed to fetch upcoming" });
  }
});

app.post("/api/bookings", async (req, res) => {
  try {
    const booking = {
      id: "BK-" + Date.now(),
      createdAt: new Date().toISOString(),
      status: "Pending",
      ...req.body
    };

    if (supabase) {
      const { data, error } = await supabase.from("bookings").insert({
        id: booking.id,
        tour_id: req.body.tourId || req.body.tour_id || null,
        name: req.body.name || null,
        email: req.body.email || null,
        phone: req.body.phone || null,
        guests: Number(req.body.guests) || 1,
        message: req.body.message || null,
        status: "Pending"
      }).select().single();
      if (error) throw error;
      return res.status(201).json({ message: "Booking enquiry received", booking: data });
    }

    const db = readLocalDb();
    db.bookings.push(booking);
    writeLocalDb(db);
    res.status(201).json({ message: "Booking enquiry received", booking });
  } catch (err) {
    console.error("POST /api/bookings error:", err.message);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

app.post("/api/enquiries", async (req, res) => {
  try {
    const enquiry = {
      id: "ENQ-" + Date.now(),
      createdAt: new Date().toISOString(),
      status: "New",
      ...req.body
    };

    if (supabase) {
      const { data, error } = await supabase.from("enquiries").insert({
        id: enquiry.id,
        name: req.body.name || null,
        email: req.body.email || null,
        phone: req.body.phone || null,
        subject: req.body.subject || null,
        message: req.body.message || null,
        status: "New"
      }).select().single();
      if (error) throw error;
      return res.status(201).json({ message: "Message received", enquiry: data });
    }

    const db = readLocalDb();
    db.enquiries.push(enquiry);
    writeLocalDb(db);
    res.status(201).json({ message: "Message received", enquiry });
  } catch (err) {
    console.error("POST /api/enquiries error:", err.message);
    res.status(500).json({ error: "Failed to create enquiry" });
  }
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

async function getStoredAdminKey() {
  if (supabase) {
    try {
      const { data } = await supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "adminKey")
        .maybeSingle();
      if (data && data.value) return data.value;
    } catch (e) {}
  }
  // Fallback to local db or env
  try {
    const db = readLocalDb();
    if (db.adminKey) return db.adminKey;
  } catch (e) {}
  return process.env.ADMIN_KEY || "admin123";
}

function adminAuth(req, res, next) {
  const clientIp = req.ip || req.connection.remoteAddress || "unknown";
  if (!checkLoginRateLimit(clientIp)) {
    return res.status(429).json({ error: "Too many failed sign-in attempts. Please try again in 15 minutes." });
  }

  const key = req.headers["x-admin-key"];

  getStoredAdminKey().then(storedKey => {
    if (!key || !verifyPassword(key, storedKey)) {
      recordFailedLogin(clientIp);
      return res.status(401).json({ error: "Unauthorized access: Invalid admin key." });
    }
    resetFailedLogin(clientIp);
    next();
  }).catch(err => {
    console.error("Admin auth error:", err.message);
    res.status(500).json({ error: "Authentication check failed" });
  });
}

app.post("/api/admin/change-password", adminAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const storedKey = await getStoredAdminKey();

    if (!currentPassword || !verifyPassword(currentPassword, storedKey)) {
      return res.status(400).json({ error: "Current password is incorrect." });
    }

    if (!newPassword || newPassword.trim().length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long." });
    }

    const hashedPassword = hashPassword(newPassword.trim());

    if (supabase) {
      const { error } = await supabase
        .from("admin_settings")
        .upsert({ key: "adminKey", value: hashedPassword, updated_at: new Date().toISOString() });
      if (error) throw error;
    } else {
      const db = readLocalDb();
      db.adminKey = hashedPassword;
      writeLocalDb(db);
    }

    res.json({ message: "Password updated successfully and encrypted with scrypt." });
  } catch (err) {
    console.error("Change password error:", err.message);
    res.status(500).json({ error: "Failed to update password" });
  }
});

app.get("/api/admin/stats", adminAuth, async (req, res) => {
  try {
    if (supabase) {
      const [tours, destinations, upcoming, gallery] = await Promise.all([
        supabase.from("tours").select("id, featured"),
        supabase.from("destinations").select("id"),
        supabase.from("upcoming").select("id"),
        supabase.from("gallery").select("id")
      ]);
      return res.json({
        tours: (tours.data || []).length,
        destinations: (destinations.data || []).length,
        upcoming: (upcoming.data || []).length,
        gallery: (gallery.data || []).length,
        featured: (tours.data || []).filter(t => t.featured).length
      });
    }
    const db = readLocalDb();
    res.json({
      tours: (db.tours || []).length,
      destinations: (db.destinations || []).length,
      upcoming: (db.upcoming || []).length,
      gallery: (db.gallery || []).length,
      featured: (db.tours || []).filter(t => t.featured).length
    });
  } catch (err) {
    console.error("GET /api/admin/stats error:", err.message);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.get("/api/admin/gallery", adminAuth, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from("gallery").select("*");
      if (error) throw error;
      return res.json(data || []);
    }
    res.json(readLocalDb().gallery);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch gallery" });
  }
});

app.get("/api/admin/destinations", adminAuth, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from("destinations").select("*");
      if (error) throw error;
      return res.json((data || []).map(destFromRow));
    }
    res.json(readLocalDb().destinations);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch destinations" });
  }
});

app.get("/api/admin/upcoming", adminAuth, async (req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase.from("upcoming").select("*");
      if (error) throw error;
      return res.json(data || []);
    }
    res.json(readLocalDb().upcoming);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch upcoming" });
  }
});

// ==========================================================================
// ADMIN MUTATION ROUTES WITH VALIDATED IMAGE UPLOADS
// ==========================================================================
app.post("/api/admin/upcoming", adminAuth, uploadImage, async (req, res) => {
  const file = getUploadedFile(req);
  if (file && !validateUploadedFile(file)) {
    return res.status(400).json({ error: "Uploaded file is corrupted or not a valid image format." });
  }

  try {
    const imageUrl = await handleImageUpload(file, "upcoming");
    const item = {
      id: "up-" + Date.now(),
      title: req.body.title || "",
      subtitle: req.body.subtitle || "",
      location: req.body.location || "",
      date: req.body.date || "",
      price: Number(req.body.price) || 0,
      category: req.body.category || "Safari",
      image: imageUrl || req.body.imageUrl || req.body.image || "/packages/lake_Bogoria.webp",
      description: req.body.description || ""
    };
    if (!item.title) return res.status(400).json({ error: "Title is required" });

    if (supabase) {
      const { data, error } = await supabase.from("upcoming").insert(item).select().single();
      if (error) throw error;
      invalidateCache("upcoming");
      return res.status(201).json(data);
    }

    const db = readLocalDb();
    db.upcoming.push(item);
    writeLocalDb(db);
    invalidateCache("upcoming");
    res.status(201).json(item);
  } catch (err) {
    console.error("POST /api/admin/upcoming error:", err.message);
    res.status(500).json({ error: "Failed to create upcoming tour" });
  }
});

app.put("/api/admin/upcoming/:id", adminAuth, uploadImage, async (req, res) => {
  const file = getUploadedFile(req);
  if (file && !validateUploadedFile(file)) {
    return res.status(400).json({ error: "Uploaded file is corrupted or not a valid image format." });
  }

  try {
    const imageUrl = await handleImageUpload(file, "upcoming");

    if (supabase) {
      // Get existing item first
      const { data: existing, error: fetchErr } = await supabase.from("upcoming").select("*").eq("id", req.params.id).maybeSingle();
      if (fetchErr) throw fetchErr;
      if (!existing) return res.status(404).json({ error: "Upcoming tour/event not found" });

      const updates = {};
      if (req.body.title !== undefined) updates.title = req.body.title;
      if (req.body.subtitle !== undefined) updates.subtitle = req.body.subtitle;
      if (req.body.location !== undefined) updates.location = req.body.location;
      if (req.body.date !== undefined) updates.date = req.body.date;
      if (req.body.price !== undefined) updates.price = Number(req.body.price) || 0;
      if (req.body.category !== undefined) updates.category = req.body.category;
      if (imageUrl) {
        // Delete old image from storage if replacing
        if (existing.image) await deleteFromStorage(existing.image);
        updates.image = imageUrl;
      } else if (req.body.imageUrl || req.body.image) {
        updates.image = req.body.imageUrl || req.body.image;
      }
      if (req.body.description !== undefined) updates.description = req.body.description;

      const { data, error } = await supabase.from("upcoming").update(updates).eq("id", req.params.id).select().single();
      if (error) throw error;
      invalidateCache("upcoming");
      return res.json(data);
    }

    const db = readLocalDb();
    const item = db.upcoming.find(u => u.id === req.params.id);
    if (!item) return res.status(404).json({ error: "Upcoming tour/event not found" });

    item.title = req.body.title !== undefined ? req.body.title : item.title;
    item.subtitle = req.body.subtitle !== undefined ? req.body.subtitle : item.subtitle;
    item.location = req.body.location !== undefined ? req.body.location : item.location;
    item.date = req.body.date !== undefined ? req.body.date : item.date;
    if (req.body.price !== undefined) item.price = Number(req.body.price) || 0;
    item.category = req.body.category !== undefined ? req.body.category : item.category;
    if (imageUrl) item.image = imageUrl;
    else if (req.body.imageUrl || req.body.image) item.image = req.body.imageUrl || req.body.image;
    item.description = req.body.description !== undefined ? req.body.description : item.description;

    writeLocalDb(db);
    invalidateCache("upcoming");
    res.json(item);
  } catch (err) {
    console.error("PUT /api/admin/upcoming error:", err.message);
    res.status(500).json({ error: "Failed to update upcoming tour" });
  }
});

app.delete("/api/admin/upcoming/:id", adminAuth, async (req, res) => {
  try {
    if (supabase) {
      // Get item to delete its storage image
      const { data: item } = await supabase.from("upcoming").select("image").eq("id", req.params.id).maybeSingle();
      if (item && item.image) await deleteFromStorage(item.image);

      const { error } = await supabase.from("upcoming").delete().eq("id", req.params.id);
      if (error) throw error;
      invalidateCache("upcoming");
      return res.json({ message: "Upcoming tour/event deleted" });
    }

    const db = readLocalDb();
    db.upcoming = db.upcoming.filter(u => u.id !== req.params.id);
    writeLocalDb(db);
    invalidateCache("upcoming");
    res.json({ message: "Upcoming tour/event deleted" });
  } catch (err) {
    console.error("DELETE /api/admin/upcoming error:", err.message);
    res.status(500).json({ error: "Failed to delete upcoming tour" });
  }
});

app.post("/api/admin/destinations", adminAuth, uploadImage, async (req, res) => {
  const file = getUploadedFile(req);
  if (file && !validateUploadedFile(file)) {
    return res.status(400).json({ error: "Uploaded file is corrupted or not a valid image format." });
  }

  try {
    const imageUrl = await handleImageUpload(file, "destinations");
    const showInSearch = req.body.showInSearch === "false" || req.body.showInSearch === false ? false : true;
    const dest = {
      id: "dest-" + Date.now(),
      name: req.body.name,
      slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-'),
      image: imageUrl || req.body.imageUrl || req.body.image || "/photos/zanzibar.jpg",
      description: req.body.description || ""
    };
    if (!dest.name) return res.status(400).json({ error: "Destination name is required" });

    if (supabase) {
      const { data, error } = await supabase.from("destinations").insert(dest).select().single();
      if (error) throw error;
      invalidateCache("destinations");
      return res.status(201).json(destFromRow(data));
    }

    dest.showInSearch = showInSearch;
    const db = readLocalDb();
    db.destinations.push(dest);
    writeLocalDb(db);
    invalidateCache("destinations");
    res.status(201).json(dest);
  } catch (err) {
    console.error("POST /api/admin/destinations error:", err.message);
    res.status(500).json({ error: "Failed to create destination" });
  }
});

app.put("/api/admin/destinations/:id", adminAuth, uploadImage, async (req, res) => {
  const file = getUploadedFile(req);
  if (file && !validateUploadedFile(file)) {
    return res.status(400).json({ error: "Uploaded file is corrupted or not a valid image format." });
  }

  try {
    const imageUrl = await handleImageUpload(file, "destinations");

    if (supabase) {
      const { data: existing, error: fetchErr } = await supabase.from("destinations").select("*").eq("id", req.params.id).maybeSingle();
      if (fetchErr) throw fetchErr;
      if (!existing) return res.status(404).json({ error: "Destination not found" });

      const updates = {};
      if (req.body.name !== undefined) updates.name = req.body.name;
      if (req.body.slug !== undefined) updates.slug = req.body.slug;
      if (imageUrl) {
        if (existing.image) await deleteFromStorage(existing.image);
        updates.image = imageUrl;
      } else if (req.body.imageUrl || req.body.image) {
        updates.image = req.body.imageUrl || req.body.image;
      }
      if (req.body.description !== undefined) updates.description = req.body.description;

      const { data, error } = await supabase.from("destinations").update(updates).eq("id", req.params.id).select().single();
      if (error) throw error;
      invalidateCache("destinations");
      return res.json(destFromRow(data));
    }

    const db = readLocalDb();
    const dest = db.destinations.find(d => d.id === req.params.id);
    if (!dest) return res.status(404).json({ error: "Destination not found" });

    dest.name = req.body.name !== undefined ? req.body.name : dest.name;
    dest.slug = req.body.slug !== undefined ? req.body.slug : dest.slug;
    if (imageUrl) dest.image = imageUrl;
    else if (req.body.imageUrl || req.body.image) dest.image = req.body.imageUrl || req.body.image;
    if (req.body.description !== undefined) dest.description = req.body.description;
    if (req.body.showInSearch !== undefined) {
      dest.showInSearch = req.body.showInSearch === "true" || req.body.showInSearch === true;
    }

    writeLocalDb(db);
    invalidateCache("destinations");
    res.json(dest);
  } catch (err) {
    console.error("PUT /api/admin/destinations error:", err.message);
    res.status(500).json({ error: "Failed to update destination" });
  }
});

app.patch("/api/admin/destinations/:id/toggle-search", adminAuth, async (req, res) => {
  try {
    if (supabase) {
      const { data: dest, error: fetchErr } = await supabase.from("destinations").select("*").eq("id", req.params.id).maybeSingle();
      if (fetchErr) throw fetchErr;
      if (!dest) return res.status(404).json({ error: "Destination not found" });

      const newVal = dest.show_in_search === false ? true : false;
      const { data, error } = await supabase.from("destinations").update({ show_in_search: newVal }).eq("id", req.params.id).select().single();
      if (error) throw error;
      invalidateCache("destinations");
      return res.json({ message: "Search status updated", dest: destFromRow(data) });
    }

    const db = readLocalDb();
    const dest = db.destinations.find(d => d.id === req.params.id);
    if (!dest) return res.status(404).json({ error: "Destination not found" });
    dest.showInSearch = dest.showInSearch === false ? true : false;
    writeLocalDb(db);
    invalidateCache("destinations");
    res.json({ message: "Search status updated", dest });
  } catch (err) {
    console.error("PATCH /api/admin/destinations/:id/toggle-search error:", err.message);
    res.status(500).json({ error: "Failed to toggle search status" });
  }
});

app.delete("/api/admin/destinations/:id", adminAuth, async (req, res) => {
  try {
    if (supabase) {
      const { data: dest } = await supabase.from("destinations").select("image").eq("id", req.params.id).maybeSingle();
      if (dest && dest.image) await deleteFromStorage(dest.image);

      const { error } = await supabase.from("destinations").delete().eq("id", req.params.id);
      if (error) throw error;
      invalidateCache("destinations");
      return res.json({ message: "Destination deleted" });
    }

    const db = readLocalDb();
    db.destinations = db.destinations.filter(d => d.id !== req.params.id);
    writeLocalDb(db);
    invalidateCache("destinations");
    res.json({ message: "Destination deleted" });
  } catch (err) {
    console.error("DELETE /api/admin/destinations error:", err.message);
    res.status(500).json({ error: "Failed to delete destination" });
  }
});

app.post("/api/admin/gallery", adminAuth, uploadImage, async (req, res) => {
  const file = getUploadedFile(req);
  if (file && !validateUploadedFile(file)) {
    return res.status(400).json({ error: "Uploaded file is corrupted or not a valid image format." });
  }

  try {
    const imageUrl = await handleImageUpload(file, "gallery");
    const image = {
      id: "gallery-" + Date.now(),
      place: req.body.place,
      caption: req.body.caption || "",
      image: imageUrl || req.body.imageUrl || req.body.image
    };
    if (!image.image || !image.place) return res.status(400).json({ error: "Place and image are required" });

    if (supabase) {
      const { data, error } = await supabase.from("gallery").insert(image).select().single();
      if (error) throw error;
      invalidateCache("gallery");
      return res.status(201).json(data);
    }

    const db = readLocalDb();
    db.gallery.push(image);
    writeLocalDb(db);
    invalidateCache("gallery");
    res.status(201).json(image);
  } catch (err) {
    console.error("POST /api/admin/gallery error:", err.message);
    res.status(500).json({ error: "Failed to add gallery image" });
  }
});

app.put("/api/admin/gallery/:id", adminAuth, async (req, res) => {
  try {
    if (supabase) {
      const { data: existing, error: fetchErr } = await supabase.from("gallery").select("*").eq("id", req.params.id).maybeSingle();
      if (fetchErr) throw fetchErr;
      if (!existing) return res.status(404).json({ error: "Gallery image not found" });

      const updates = {};
      if (req.body.place !== undefined) updates.place = req.body.place;
      if (req.body.caption !== undefined) updates.caption = req.body.caption;

      const { data, error } = await supabase.from("gallery").update(updates).eq("id", req.params.id).select().single();
      if (error) throw error;
      invalidateCache("gallery");
      return res.json(data);
    }

    const db = readLocalDb();
    const image = db.gallery.find(item => item.id === req.params.id);
    if (!image) return res.status(404).json({ error: "Gallery image not found" });

    if (req.body.place !== undefined) image.place = req.body.place;
    image.caption = req.body.caption || "";
    writeLocalDb(db);
    invalidateCache("gallery");
    res.json(image);
  } catch (err) {
    console.error("PUT /api/admin/gallery error:", err.message);
    res.status(500).json({ error: "Failed to update gallery image" });
  }
});

app.delete("/api/admin/gallery/:id", adminAuth, async (req, res) => {
  try {
    if (supabase) {
      const { data: image } = await supabase.from("gallery").select("image").eq("id", req.params.id).maybeSingle();
      if (image && image.image) await deleteFromStorage(image.image);

      const { error } = await supabase.from("gallery").delete().eq("id", req.params.id);
      if (error) throw error;
      invalidateCache("gallery");
      return res.json({ message: "Gallery image deleted" });
    }

    const db = readLocalDb();
    db.gallery = db.gallery.filter(image => image.id !== req.params.id);
    writeLocalDb(db);
    invalidateCache("gallery");
    res.json({ message: "Gallery image deleted" });
  } catch (err) {
    console.error("DELETE /api/admin/gallery error:", err.message);
    res.status(500).json({ error: "Failed to delete gallery image" });
  }
});

app.post("/api/admin/tours", adminAuth, uploadImage, async (req, res) => {
  const file = getUploadedFile(req);
  if (file && !validateUploadedFile(file)) {
    return res.status(400).json({ error: "Uploaded file is corrupted or not a valid image format." });
  }

  try {
    const imageUrl = await handleImageUpload(file, "tours");
    const tourImage = imageUrl || req.body.image || req.body.imageUrl || "/photos/wild_beest.jpg";

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

    if (supabase) {
      const { data, error } = await supabase.from("tours").insert({
        id: tour.id,
        title: tour.title,
        slug: tour.slug,
        destination: tour.destination,
        location: tour.location,
        category: tour.category,
        duration: tour.duration,
        price: tour.price,
        group_size: tour.groupSize,
        rating: tour.rating,
        featured: tour.featured,
        image: tour.image,
        short_description: tour.shortDescription,
        description: tour.description,
        inclusions: tour.inclusions,
        exclusions: tour.exclusions,
        itinerary: tour.itinerary
      }).select().single();
      if (error) throw error;
      invalidateCache("tours");
      return res.status(201).json(tourFromRow(data));
    }

    const db = readLocalDb();
    db.tours.push(tour);
    writeLocalDb(db);
    invalidateCache("tours");
    res.status(201).json(tour);
  } catch (err) {
    console.error("POST /api/admin/tours error:", err.message);
    res.status(500).json({ error: "Failed to create tour" });
  }
});

app.put("/api/admin/tours/:id", adminAuth, uploadImage, async (req, res) => {
  const file = getUploadedFile(req);
  if (file && !validateUploadedFile(file)) {
    return res.status(400).json({ error: "Uploaded file is corrupted or not a valid image format." });
  }

  try {
    const imageUrl = await handleImageUpload(file, "tours");

    if (supabase) {
      const { data: existing, error: fetchErr } = await supabase.from("tours").select("*").eq("id", req.params.id).maybeSingle();
      if (fetchErr) throw fetchErr;
      if (!existing) return res.status(404).json({ error: "Tour not found" });

      const tourImage = imageUrl || req.body.image || req.body.imageUrl || existing.image;
      if (imageUrl && existing.image) await deleteFromStorage(existing.image);

      const updates = {
        title: req.body.title !== undefined ? req.body.title : existing.title,
        slug: req.body.slug !== undefined ? req.body.slug : existing.slug,
        destination: req.body.destination !== undefined ? req.body.destination : existing.destination,
        location: req.body.location !== undefined ? req.body.location : existing.location,
        category: req.body.category !== undefined ? req.body.category : existing.category,
        duration: req.body.duration ? Number(req.body.duration) : existing.duration,
        price: req.body.price ? Number(req.body.price) : existing.price,
        group_size: req.body.groupSize ? Number(req.body.groupSize) : existing.group_size,
        featured: req.body.featured === "true" || req.body.featured === true,
        image: tourImage,
        short_description: req.body.shortDescription !== undefined ? req.body.shortDescription : existing.short_description,
        description: req.body.description !== undefined ? req.body.description : existing.description
      };

      const { data, error } = await supabase.from("tours").update(updates).eq("id", req.params.id).select().single();
      if (error) throw error;
      invalidateCache("tours");
      return res.json(tourFromRow(data));
    }

    const db = readLocalDb();
    const index = db.tours.findIndex(t => t.id === req.params.id);
    if (index < 0) return res.status(404).json({ error: "Tour not found" });
    
    const existing = db.tours[index];
    const tourImage = imageUrl || req.body.image || req.body.imageUrl || existing.image;
    
    db.tours[index] = {
      ...existing,
      ...req.body,
      duration: req.body.duration ? Number(req.body.duration) : existing.duration,
      price: req.body.price ? Number(req.body.price) : existing.price,
      featured: req.body.featured === "true" || req.body.featured === true,
      image: tourImage
    };
    writeLocalDb(db);
    invalidateCache("tours");
    res.json(db.tours[index]);
  } catch (err) {
    console.error("PUT /api/admin/tours error:", err.message);
    res.status(500).json({ error: "Failed to update tour" });
  }
});

app.delete("/api/admin/tours/:id", adminAuth, async (req, res) => {
  try {
    if (supabase) {
      const { data: tour } = await supabase.from("tours").select("image").eq("id", req.params.id).maybeSingle();
      if (tour && tour.image) await deleteFromStorage(tour.image);

      const { error } = await supabase.from("tours").delete().eq("id", req.params.id);
      if (error) throw error;
      invalidateCache("tours");
      return res.json({ message: "Tour deleted" });
    }

    const db = readLocalDb();
    db.tours = db.tours.filter(t => t.id !== req.params.id);
    writeLocalDb(db);
    invalidateCache("tours");
    res.json({ message: "Tour deleted" });
  } catch (err) {
    console.error("DELETE /api/admin/tours error:", err.message);
    res.status(500).json({ error: "Failed to delete tour" });
  }
});

// ==========================================================================
// ONE-TIME SEED ENDPOINT — populates Supabase from local seed data
// ==========================================================================
app.post("/api/admin/seed", adminAuth, async (req, res) => {
  if (!supabase) return res.status(400).json({ error: "Supabase is not configured" });

  try {
    const results = {};

    // Seed tours
    const { data: existingTours } = await supabase.from("tours").select("id");
    if (!existingTours || existingTours.length === 0) {
      const tours = seedTours().map(t => ({
        id: t.id, title: t.title, slug: t.slug, destination: t.destination,
        location: t.location, category: t.category, duration: t.duration,
        price: t.price, group_size: t.groupSize, rating: t.rating,
        featured: t.featured, image: t.image,
        short_description: t.shortDescription, description: t.description,
        inclusions: t.inclusions, exclusions: t.exclusions, itinerary: t.itinerary
      }));
      const { error } = await supabase.from("tours").upsert(tours);
      results.tours = error ? `Error: ${error.message}` : `${tours.length} seeded`;
    } else {
      results.tours = `Already has ${existingTours.length} tours, skipped`;
    }

    // Seed gallery
    const { data: existingGallery } = await supabase.from("gallery").select("id");
    if (!existingGallery || existingGallery.length === 0) {
      const gallery = seedGallery();
      const { error } = await supabase.from("gallery").upsert(gallery);
      results.gallery = error ? `Error: ${error.message}` : `${gallery.length} seeded`;
    } else {
      results.gallery = `Already has ${existingGallery.length} images, skipped`;
    }

    // Seed destinations
    const { data: existingDests } = await supabase.from("destinations").select("id");
    if (!existingDests || existingDests.length === 0) {
      const dests = seedDestinations().map(d => ({
        id: d.id, name: d.name, slug: d.slug, image: d.image,
        description: d.description, show_in_search: d.showInSearch
      }));
      const { error } = await supabase.from("destinations").upsert(dests);
      results.destinations = error ? `Error: ${error.message}` : `${dests.length} seeded`;
    } else {
      results.destinations = `Already has ${existingDests.length} destinations, skipped`;
    }

    // Seed upcoming
    const { data: existingUpcoming } = await supabase.from("upcoming").select("id");
    if (!existingUpcoming || existingUpcoming.length === 0) {
      const upcoming = seedUpcoming();
      const { error } = await supabase.from("upcoming").upsert(upcoming);
      results.upcoming = error ? `Error: ${error.message}` : `${upcoming.length} seeded`;
    } else {
      results.upcoming = `Already has ${existingUpcoming.length} items, skipped`;
    }

    invalidateCache(); // Invalidate all cached data upon seeding

    // Seed default admin key
    const { data: existingKey } = await supabase.from("admin_settings").select("key").eq("key", "adminKey").maybeSingle();
    if (!existingKey) {
      const { error } = await supabase.from("admin_settings").upsert({ key: "adminKey", value: "admin123" });
      results.adminKey = error ? `Error: ${error.message}` : "Default key seeded";
    } else {
      results.adminKey = "Already set, skipped";
    }

    res.json({ message: "Seed complete", results });
  } catch (err) {
    console.error("POST /api/admin/seed error:", err.message);
    res.status(500).json({ error: "Seed failed: " + err.message });
  }
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
  app.listen(PORT, () => {
    console.log(`Supreme Adventures server running on port ${PORT}`);
    if (supabase) {
      console.log("✅ Supabase active: Production PostgreSQL database and Cloud Storage connected.");
    } else {
      console.warn("\n=============================================================");
      console.warn("⚠️  WARNING: Supabase is NOT configured!");
      console.warn("⚠️  Render/cloud containers have an EPHEMERAL filesystem.");
      console.warn("⚠️  Any admin uploads will be lost on container restart/redeploy.");
      console.warn("⚠️  Please set SUPABASE_URL and SUPABASE_SECRET_KEY in Render Dashboard.");
      console.warn("=============================================================\n");
    }
  });
}

module.exports = app;
