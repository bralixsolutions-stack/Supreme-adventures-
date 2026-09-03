const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const PORT = process.env.PORT || 3000;
const IS_VERCEL = process.env.VERCEL || process.env.NOW_BUILDER;
const DATA_DIR = IS_VERCEL ? path.join("/tmp", "data") : path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const ORIGINAL_DB_FILE = path.join(__dirname, "data", "db.json");
const UPLOADS_DIR = IS_VERCEL ? path.join("/tmp", "uploads") : path.join(__dirname, "public", "uploads");

try { fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } catch (e) {}
try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (e) {}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => cb(null, `gallery-${Date.now()}${path.extname(file.originalname).toLowerCase()}`)
  }),
  fileFilter: (req, file, cb) => cb(null, file.mimetype.startsWith("image/")),
  limits: { fileSize: 8 * 1024 * 1024 }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

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
  let db = { tours: seedTours(), gallery: seedGallery(), destinations: seedDestinations(), bookings: [], enquiries: [] };
  if (fs.existsSync(DB_FILE)) {
    try { db = JSON.parse(fs.readFileSync(DB_FILE, "utf8")); } catch (e) {}
  }
  if (!Array.isArray(db.gallery) || db.gallery.length === 0) db.gallery = seedGallery();
  if (!Array.isArray(db.destinations) || db.destinations.length === 0) db.destinations = seedDestinations();
  return db;
}

function seedGallery() {
  return [
    { id: "g-01", place: "Maasai Mara, Kenya", caption: "Big Game & 4x4 Safari Expeditions", category: "safari", tag: "Safari Expedition", image: "/photos/jeep_safari.jpg", featured: "wide" },
    { id: "g-02", place: "Savannah Plains", caption: "King of the Jungle in Masai Mara", category: "safari", tag: "Wildlife", image: "/photos/lion.jpg" },
    { id: "g-03", place: "Mara River Crossing", caption: "The Great Wildebeest Migration", category: "safari", tag: "Great Migration", image: "/photos/wild_beest.jpg" },
    { id: "g-04", place: "Amboseli National Park", caption: "Elephants & Mt Kilimanjaro Views", category: "safari", tag: "Amboseli Elephants", image: "/photos/amboseli.jpg" },
    { id: "g-05", place: "Zanzibar Archipelago", caption: "Turquoise Waters & Coral Reefs", category: "beach", tag: "Island Escape", image: "/photos/zanzibar.jpg", featured: "tall" },
    { id: "g-06", place: "Malindi Coast", caption: "Golden Sunsets & Tropical Breezes", category: "beach", tag: "Coastal Haven", image: "/photos/malindi.jpg" },
    { id: "g-07", place: "Mombasa Island", caption: "Swahili Heritage & Marine Adventures", category: "beach", tag: "Beach Resort", image: "/photos/mombasa.jpg" },
    { id: "g-08", place: "Lamu Archipelago", caption: "Traditional Dhow Sailing & Old Town", category: "adventure", tag: "Cultural Heritage", image: "/photos/lamu.jpg" },
    { id: "g-09", place: "Kigali & Virunga", caption: "Land of 1,000 Hills & Gorilla Trekking", category: "adventure", tag: "Rwanda Escape", image: "/photos/rwanda.jpg" },
    { id: "g-10", place: "Cape Peninsula", caption: "Table Mountain & Atlantic Oceans", category: "adventure", tag: "Cape Town", image: "/photos/capetown.jpg" },
    { id: "g-11", place: "Happy Adventurers", caption: "Memorable Group Journeys & Client Stories", category: "clients", tag: "Traveler Stories", image: "/photos/client_1.jpeg" },
    { id: "g-12", place: "Safari Crew", caption: "Group Joining & Unforgettable Moments", category: "clients", tag: "Safari Crew", image: "/photos/client_2.jpeg" },
    { id: "g-13", place: "Overland Truck Party", caption: "Road Trips & Celebrations across East Africa", category: "clients", tag: "Truck Party", image: "/photos/client_3.jpeg" }
  ];
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
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
      price: 520,
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
      price: 390,
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
      price: 680,
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
      price: 980,
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

ensureDb();function seedDestinations() {
  return [
    { id: "dest-mara", name: "Maasai Mara National Reserve", slug: "maasai-mara", image: "/photos/lion.jpg", description: "World-famous Great Migration & Big Five game drives." },
    { id: "dest-zanzibar", name: "Zanzibar Tropical Island", slug: "zanzibar", image: "/photos/zanzibar.jpg", description: "White sand beaches, Stone Town culture & dhow cruises." },
    { id: "dest-amboseli", name: "Amboseli National Park", slug: "amboseli", image: "/photos/amboseli.jpg", description: "Majestic elephant herds under snow-capped Mt Kilimanjaro." },
    { id: "dest-serengeti", name: "Serengeti National Park", slug: "serengeti", image: "/photos/jeep_safari.jpg", description: "Endless savannah plains & legendary predator encounters." },
    { id: "dest-rift", name: "Great Rift Valley & Lakes", slug: "rift-valley", image: "/photos/client_3.jpeg", description: "Geysers, flamingos & volcanic crater adventures." }
  ];
}

function ensureDb() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({
      tours: seedTours(),
      gallery: seedGallery(),
      destinations: seedDestinations(),
      bookings: [],
      enquiries: []
    }, null, 2));
  }
}

function readDb() {
  ensureDb();
  const db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
  if (!Array.isArray(db.gallery) || db.gallery.length === 0) {
    db.gallery = seedGallery();
    writeDb(db);
  }
  if (!Array.isArray(db.destinations) || db.destinations.length === 0) {
    db.destinations = seedDestinations();
    writeDb(db);
  }
  return db;
}

function writeDb(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

app.get("/api/tours", (req, res) => {
  const db = readDb();
  let tours = db.tours;
  const { destination, category, duration, maxPrice, search, featured } = req.query;

  if (destination && destination !== "All destinations") {
    const d = destination.toLowerCase().trim();
    tours = tours.filter(t => 
      (t.destination && t.destination.toLowerCase().includes(d)) || 
      (t.location && t.location.toLowerCase().includes(d)) || 
      (t.title && t.title.toLowerCase().includes(d)) ||
      (d.includes("mara") && (t.location.toLowerCase().includes("mara") || t.title.toLowerCase().includes("mara"))) ||
      (d.includes("amboseli") && (t.location.toLowerCase().includes("amboseli") || t.title.toLowerCase().includes("amboseli"))) ||
      (d.includes("zanzibar") && (t.location.toLowerCase().includes("zanzibar") || t.title.toLowerCase().includes("zanzibar"))) ||
      (d.includes("mombasa") && (t.location.toLowerCase().includes("mombasa") || t.title.toLowerCase().includes("mombasa"))) ||
      (d.includes("malindi") && (t.location.toLowerCase().includes("malindi") || t.title.toLowerCase().includes("malindi"))) ||
      (d.includes("lamu") && (t.location.toLowerCase().includes("lamu") || t.title.toLowerCase().includes("lamu")))
    );
  }

  if (category && category !== "All types") {
    const c = category.toLowerCase().trim();
    tours = tours.filter(t => {
      if (!t.category) return false;
      const cat = t.category.toLowerCase();
      return cat.includes(c) || c.includes(cat) ||
        (c.includes("safari") && cat.includes("safari")) ||
        (c.includes("beach") && (cat.includes("beach") || cat.includes("coastal") || cat.includes("marine"))) ||
        (c.includes("culture") && (cat.includes("culture") || cat.includes("island"))) ||
        (c.includes("wildlife") && (cat.includes("wildlife") || cat.includes("safari")));
    });
  }

  if (duration && duration !== "Any duration") {
    const durNum = Number(duration);
    if (!isNaN(durNum)) {
      tours = tours.filter(t => Number(t.duration) === durNum || (durNum === 5 && Number(t.duration) >= 5));
    }
  }

  if (maxPrice) tours = tours.filter(t => Number(t.price) <= Number(maxPrice));
  if (featured === "true") tours = tours.filter(t => t.featured);
  if (search) {
    const q = search.toLowerCase();
    tours = tours.filter(t => `${t.title} ${t.location} ${t.destination} ${t.category} ${t.shortDescription}`.toLowerCase().includes(q));
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

function adminAuth(req, res, next) {
  const key = req.headers["x-admin-key"];
  if (key !== (process.env.ADMIN_KEY || "admin123")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.get("/api/admin/stats", adminAuth, (req, res) => {
  const db = readDb();
  res.json({
    tours: db.tours.length,
    destinations: db.destinations.length,
    bookings: db.bookings.length,
    enquiries: db.enquiries.length,
    featured: db.tours.filter(t => t.featured).length
  });
});

app.get("/api/admin/bookings", adminAuth, (req, res) => res.json(readDb().bookings));
app.get("/api/admin/enquiries", adminAuth, (req, res) => res.json(readDb().enquiries));
app.get("/api/admin/gallery", adminAuth, (req, res) => res.json(readDb().gallery));
app.get("/api/admin/destinations", adminAuth, (req, res) => res.json(readDb().destinations));

app.post("/api/admin/destinations", adminAuth, upload.single("image"), (req, res) => {
  const db = readDb();
  const dest = {
    id: "dest-" + Date.now(),
    name: req.body.name,
    slug: req.body.slug || req.body.name.toLowerCase().replace(/\s+/g, '-'),
    image: req.file ? "/uploads/" + req.file.filename : req.body.imageUrl || req.body.image || "/photos/zanzibar.jpg",
    description: req.body.description || ""
  };
  if (!dest.name) return res.status(400).json({ error: "Destination name is required" });
  db.destinations.push(dest);
  writeDb(db);
  res.status(201).json(dest);
});

app.put("/api/admin/destinations/:id", adminAuth, upload.single("image"), (req, res) => {
  const db = readDb();
  const dest = db.destinations.find(d => d.id === req.params.id);
  if (!dest) return res.status(404).json({ error: "Destination not found" });

  dest.name = req.body.name || dest.name;
  dest.slug = req.body.slug || dest.slug;
  if (req.file) dest.image = "/uploads/" + req.file.filename;
  else if (req.body.imageUrl || req.body.image) dest.image = req.body.imageUrl || req.body.image;
  dest.description = req.body.description || dest.description;

  writeDb(db);
  res.json(dest);
});

app.delete("/api/admin/destinations/:id", adminAuth, (req, res) => {
  const db = readDb();
  db.destinations = db.destinations.filter(d => d.id !== req.params.id);
  writeDb(db);
  res.json({ message: "Destination deleted" });
});

app.post("/api/admin/gallery", adminAuth, upload.single("image"), (req, res) => {
  const db = readDb();
  const image = { id: "gallery-" + Date.now(), place: req.body.place, caption: req.body.caption || "", image: req.file ? "/uploads/" + req.file.filename : req.body.imageUrl || req.body.image };
  if (!image.image || !image.place) return res.status(400).json({ error: "place and image file are required" });
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
    price: Number(req.body.price) || 500,
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

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Supreme Adventures website running at http://localhost:${PORT}`);
    console.log(`Admin key: ${process.env.ADMIN_KEY || "admin123"}`);
  });
}

module.exports = app;
