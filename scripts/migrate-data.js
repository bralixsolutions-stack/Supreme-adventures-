// ==========================================================================
// SUPREME ADVENTURES — DATABASE MIGRATION SCRIPT
// Migrates all Tours, Destinations, Upcoming Events, and Gallery to Supabase
// ==========================================================================
const supabase = require("../api/supabaseClient");
const fs = require("fs");
const path = require("path");

if (!supabase) {
  console.error("❌ Supabase client not initialized. Please check SUPABASE_URL and SUPABASE_SECRET_KEY.");
  process.exit(1);
}

const ALL_TOURS = [
  {
    id: "tour-001",
    title: "4 Days Masai Mara & Lake Nakuru Safari",
    slug: "4-days-masai-mara-lake-nakuru",
    destination: "Kenya",
    location: "Masai Mara & Lake Nakuru",
    category: "Safari",
    duration: 4,
    price: 68000,
    group_size: 7,
    rating: 4.9,
    featured: true,
    image: "/photos/wild_beest.webp",
    short_description: "A classic Kenya safari combining the wildlife-rich Masai Mara with Lake Nakuru flamingos and rhinos.",
    description: "Experience spectacular landscapes, big game and unforgettable safari moments on a carefully paced four-day adventure through the Great Rift Valley and legendary Masai Mara.",
    inclusions: [
      "Transport in 4x4 custom safari vehicle with pop-up roof",
      "Park and reserve entry fees for Masai Mara & Lake Nakuru",
      "Professional English-speaking safari guide & driver",
      "Full board accommodation in luxury safari lodges / tented camps",
      "Daily game drives and mineral water during safaris"
    ],
    exclusions: [
      "International and domestic flights",
      "Travel and medical insurance",
      "Personal expenses, laundry, and tips",
      "Alcoholic and soft drinks at lodges"
    ],
    itinerary: [
      ["Day 1", "Nairobi to Masai Mara", "Depart Nairobi via Great Rift Valley viewpoint. Arrive at Masai Mara for lunch followed by an introductory late-afternoon game drive."],
      ["Day 2", "Masai Mara Full Day Game Drive", "Full day exploring the vast Mara plains with picnic lunch near the Mara River searching for the Big Five and cheetahs."],
      ["Day 3", "Masai Mara to Lake Nakuru", "Early morning sunrise game drive, breakfast, then scenic transfer to Lake Nakuru National Park for an afternoon rhino sanctuary drive."],
      ["Day 4", "Lake Nakuru to Nairobi", "Morning bird watching and game drive at Lake Nakuru, followed by lunch and return transfer to Nairobi arriving by 4:00 PM."]
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
    group_size: 7,
    rating: 4.8,
    featured: true,
    image: "/photos/amboseli.webp",
    short_description: "Majestic elephant herds roaming open savannah under snow-capped Mount Kilimanjaro.",
    description: "Discover Amboseli's world-famous elephant herds, observation hill panoramic views, and dramatic Kilimanjaro backdrops on a compact three-day safari.",
    inclusions: [
      "Transport in 4x4 safari cruiser with pop-up roof",
      "Amboseli National Park entry fees",
      "Professional tour guide and driver",
      "2 nights full board accommodation at safari lodge",
      "Comprehensive daily game drives"
    ],
    exclusions: [
      "International flights and visa fees",
      "Travel insurance",
      "Personal purchases and tips",
      "Optional Maasai village cultural visit"
    ],
    itinerary: [
      ["Day 1", "Nairobi to Amboseli", "Depart Nairobi morning, drive south through scenic savannah, arrive for lodge check-in, lunch, and afternoon game drive."],
      ["Day 2", "Amboseli Full Day Exploration", "Morning and afternoon game drives with prime elephant viewing at Ol Okenya swamp and panoramic lunch at Observation Hill."],
      ["Day 3", "Amboseli to Nairobi", "Sunrise game drive with Mt Kilimanjaro clear morning views, hearty breakfast, and return scenic drive to Nairobi."]
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
    group_size: 8,
    rating: 4.9,
    featured: true,
    image: "/photos/jeep_safari.webp",
    short_description: "A balanced introduction to Kenya's most celebrated safari destinations and wildlife reserves.",
    description: "A five-day circuit designed for travelers who want big cats, rhino sanctuaries, Great Rift Valley lakes, and rich Maasai culture in one seamless journey.",
    inclusions: [
      "4x4 Land Cruiser safari vehicle with charging ports",
      "All national park and conservation fees",
      "Expert driver guide throughout the trip",
      "4 nights luxury accommodation with all meals",
      "Government taxes and levies"
    ],
    exclusions: [
      "Flights and travel insurance",
      "Visa fees",
      "Items of a personal nature",
      "Hot air balloon safari over the Mara (optional)"
    ],
    itinerary: [
      ["Day 1", "Nairobi to Lake Naivasha", "Morning departure to Lake Naivasha, afternoon boat ride to Crescent Island walking safari with giraffes."],
      ["Day 2", "Lake Naivasha to Lake Nakuru", "Drive to Lake Nakuru National Park for game viewing of flamingos, white rhinos, and endangered Rothschild giraffes."],
      ["Day 3", "Lake Nakuru to Masai Mara", "Scenic drive through Narok into Masai Mara, lunch, and an introductory wildlife tracking drive."],
      ["Day 4", "Masai Mara Full Day", "Comprehensive exploration of the Mara triangle with picnic lunch along the riverbanks."],
      ["Day 5", "Masai Mara to Nairobi", "Early morning game drive, breakfast, and leisurely drive back to Nairobi with airport drop-off."]
    ]
  },
  {
    id: "tour-004",
    title: "6 Days Tanzania Wildlife Escape",
    slug: "6-days-tanzania-wildlife-escape",
    destination: "Tanzania",
    location: "Arusha, Tarangire, Serengeti & Ngorongoro",
    category: "Wildlife",
    duration: 6,
    price: 125000,
    group_size: 7,
    rating: 5.0,
    featured: false,
    image: "/photos/serengeti.jpg",
    short_description: "Explore northern Tanzania with Serengeti predator drives, Ngorongoro Crater, and Tarangire baobabs.",
    description: "Embark on an epic 6-day expedition across Tanzania's premier Northern Safari Circuit, including the vast Serengeti plains and the UNESCO World Heritage Ngorongoro Caldera.",
    inclusions: [
      "4x4 safari cruiser with unlimited game viewing mileage",
      "Serengeti, Ngorongoro Crater & Tarangire conservation fees",
      "Experienced Tanzanian safari guide",
      "Full board lodge accommodation",
      "Crater service fees and transit permits"
    ],
    exclusions: [
      "International flights to/from Kilimanjaro (JRO)",
      "Tanzania tourist visa",
      "Tips for guide and camp staff",
      "Personal travel insurance"
    ],
    itinerary: [
      ["Day 1", "Arusha to Tarangire", "Pick up in Arusha, drive to Tarangire National Park known for giant baobabs and large elephant herds."],
      ["Day 2", "Tarangire to Serengeti", "Journey through the Ngorongoro highlands into the endless plains of the central Serengeti (Seronera)."],
      ["Day 3", "Serengeti Full Day", "Full day following lion prides, leopards, and seasonal migration herds across the Serengeti savannah."],
      ["Day 4", "Serengeti to Ngorongoro Rim", "Morning game drive, then transfer to the Ngorongoro Crater rim for spectacular sunset views."],
      ["Day 5", "Ngorongoro Crater Floor", "Descend 600m into the crater floor for a 6-hour wildlife game drive with high density of black rhinos and predators."],
      ["Day 6", "Ngorongoro to Arusha", "Morning cultural visit to Mto wa Mbu village, lunch, and return transfer to Arusha."]
    ]
  },
  {
    id: "tour-005",
    title: "5 Days Zanzibar Tropical Beach & Culture",
    slug: "5-days-zanzibar-beach-culture",
    destination: "Zanzibar",
    location: "Stone Town & Nungwi Beach",
    category: "Beach",
    duration: 5,
    price: 85000,
    group_size: 6,
    rating: 4.9,
    featured: true,
    image: "/photos/zanzibar.webp",
    short_description: "Pristine white sand beaches, turquoise Indian Ocean waters, and historic Stone Town charm.",
    description: "Unwind on Zanzibar's world-famous turquoise coast with sunset dhow cruises, spice plantation tours, and luxury beachfront resort relaxation.",
    inclusions: [
      "Airport transfers in Zanzibar",
      "2 nights Stone Town historic boutique hotel + 2 nights Nungwi Beach resort",
      "Guided Stone Town walking tour & Prison Island giant tortoise sanctuary",
      "Authentic Swahili Spice Farm tour with traditional lunch",
      "Sunset Dhow sailing cruise with refreshments"
    ],
    exclusions: [
      "International flights and Tanzania visa",
      "Water sports and scuba diving fees",
      "Personal tips and laundry",
      "Travel insurance"
    ],
    itinerary: [
      ["Day 1", "Arrival in Stone Town", "Meet & greet at Zanzibar International Airport, check into Stone Town hotel, evening street food tour at Forodhani Gardens."],
      ["Day 2", "Stone Town & Prison Island", "Morning historical walking tour of House of Wonders and Sultan's Palace, afternoon boat trip to Prison Island."],
      ["Day 3", "Spice Tour & Transfer to Nungwi", "Tour aromatic organic spice farms, taste fresh tropical fruits, transfer to northern white sand beaches in Nungwi."],
      ["Day 4", "Nungwi Beach & Sunset Dhow Cruise", "Free day for swimming, snorkeling at Mnemba Atoll, followed by an evening traditional wooden dhow sunset sail."],
      ["Day 5", "Departure", "Relaxation at the resort, souvenir shopping, and transfer to airport for departure."]
    ]
  },
  {
    id: "tour-006",
    title: "3 Days Tsavo National Park Safari",
    slug: "3-days-tsavo-safari",
    destination: "Kenya",
    location: "Tsavo East & West",
    category: "Safari",
    duration: 3,
    price: 48000,
    group_size: 7,
    rating: 4.8,
    featured: true,
    image: "/photos/tsavo_1.jpg",
    short_description: "Untamed landscapes, famous red elephants, Mzima Springs, and rugged volcanic scenery.",
    description: "Explore Kenya's largest national park with dramatic views of Yatta Plateau, crystal-clear underwater hippo viewing at Mzima Springs, and red-dust elephant herds.",
    inclusions: [
      "4x4 safari vehicle transport",
      "Park entrance fees to Tsavo East and Tsavo West",
      "Full board safari lodge accommodation",
      "Game drives and Mzima Springs guided nature walk",
      "Driver guide services"
    ],
    exclusions: [
      "Travel insurance",
      "Personal drinks and tips",
      "Visa fees"
    ],
    itinerary: [
      ["Day 1", "Nairobi to Tsavo West", "Drive to Tsavo West, check in at lodge, visit Shetani lava flow and afternoon game drive."],
      ["Day 2", "Mzima Springs to Tsavo East", "Morning walk at Mzima Springs to view hippos and fish, transfer to Tsavo East for red elephant tracking."],
      ["Day 3", "Tsavo East to Nairobi", "Sunrise game drive along the Galana River, breakfast, and return drive to Nairobi."]
    ]
  },
  {
    id: "tour-007",
    title: "3 Days Sagana Adrenaline & White Water Rafting",
    slug: "3-days-sagana-adventure",
    destination: "Kenya",
    location: "Sagana, River Tana",
    category: "Adventure",
    duration: 3,
    price: 48000,
    group_size: 10,
    rating: 4.9,
    featured: false,
    image: "/photos/sagana_1.avif",
    short_description: "Get outdoors, get your adrenaline going with Grade 3-5 river rafting, kayaking, and ziplining.",
    description: "An action-packed weekend adventure in Sagana featuring white water rafting down the Tana River, river plunge jumps, ziplining over waterfalls, and campfire barbecues.",
    inclusions: [
      "Round-trip transport from Nairobi",
      "2 nights riverside camp / cottage accommodation",
      "Full day white water rafting expedition with certified guides and safety gear",
      "Ziplining experience over the rapids",
      "All meals including evening campfire BBQ"
    ],
    exclusions: [
      "Personal items and swimwear",
      "Alcoholic drinks",
      "Personal accident insurance"
    ],
    itinerary: [
      ["Day 1", "Nairobi to Sagana", "Depart Nairobi morning, arrive at Sagana camp, lunch, afternoon kayaking and river plunge."],
      ["Day 2", "White Water Rafting & Zipline", "Intensive 4-hour white water rafting down the Tana River rapids, followed by waterfall ziplining."],
      ["Day 3", "Nature Hike & Return", "Morning nature walk along Mt Kenya foothills, river swimming, lunch, and return transfer to Nairobi."]
    ]
  },
  {
    id: "tour-008",
    title: "3 Days Mombasa Coastal Beach Getaway",
    slug: "3-days-mombasa-coastal-getaway",
    destination: "Kenya",
    location: "Mombasa & Nyali",
    category: "Beach",
    duration: 3,
    price: 55000,
    group_size: 6,
    rating: 4.8,
    featured: true,
    image: "/photos/mombasa.webp",
    short_description: "Sun-drenched palm beaches, ancient Fort Jesus, and rich Swahili coastal hospitality.",
    description: "Enjoy a relaxing ocean break in Mombasa featuring beachfront resort stays, historic Fort Jesus and Old Town exploration, and fresh coastal seafood dining.",
    inclusions: [
      "Return SGR train tickets (First / Economy Class) with station transfers",
      "2 nights 4-star beachfront resort accommodation (Half Board)",
      "Mombasa Old Town and Fort Jesus guided cultural tour",
      "Haller Park wildlife sanctuary excursion"
    ],
    exclusions: [
      "Personal purchases, souvenirs, and tips",
      "Alcoholic beverages",
      "Optional water sports activities"
    ],
    itinerary: [
      ["Day 1", "Nairobi to Mombasa by SGR", "Morning scenic SGR train ride, station pickup, resort check-in, afternoon relaxation by the Indian Ocean."],
      ["Day 2", "Fort Jesus, Old Town & Haller Park", "Explore 16th-century Portuguese Fort Jesus, walk the narrow Swahili streets, and feed giraffes at Haller Park."],
      ["Day 3", "Beach Relaxation & Return", "Morning beach swim, souvenir shopping at Akamba Woodcarvers, and afternoon return SGR train to Nairobi."]
    ]
  },
  {
    id: "tour-009",
    title: "4 Days Cape Town Peninsula & Table Mountain",
    slug: "4-days-cape-town-staycation",
    destination: "South Africa",
    location: "Cape Town",
    category: "Safari",
    duration: 4,
    price: 68000,
    group_size: 6,
    rating: 5.0,
    featured: false,
    image: "/photos/capetown.webp",
    short_description: "Table Mountain cable car, Cape Peninsula coastal drive, Boulders Beach penguins, and V&A Waterfront.",
    description: "Explore the stunning beauty of Cape Town with our signature peninsula tour, iconic Table Mountain summit views, Cape Point nature reserve, and world-class culinary experiences.",
    inclusions: [
      "Airport transfers in Cape Town",
      "3 nights 4-star central hotel accommodation with breakfast",
      "Table Mountain cableway return tickets",
      "Full-day Cape Peninsula tour including Cape of Good Hope & Boulders Beach penguins",
      "Hop-on Hop-off sightseeing pass"
    ],
    exclusions: [
      "International flights to/from Cape Town",
      "South Africa visa fees (if applicable)",
      "Lunches and dinners not specified",
      "Travel insurance"
    ],
    itinerary: [
      ["Day 1", "Arrival & V&A Waterfront", "Arrival at Cape Town International Airport, hotel check-in, sunset dinner at Victoria & Alfred Waterfront."],
      ["Day 2", "Table Mountain & City Tour", "Ascend Table Mountain via aerial cableway, explore Bo-Kaap colorful quarter and Kirstenbosch Botanical Gardens."],
      ["Day 3", "Full Day Cape Point & Peninsula", "Drive along Chapman's Peak, visit Cape Point, Cape of Good Hope, and see African penguins at Boulders Beach."],
      ["Day 4", "Cape Winelands & Departure", "Morning excursion to Stellenbosch / Franschhoek vineyards, wine tasting, and airport transfer."]
    ]
  },
  {
    id: "tour-010",
    title: "4 Days Rwanda Cultural & Gorilla Trekking Safari",
    slug: "4-days-rwanda-cultural-safari",
    destination: "Rwanda",
    location: "Kigali & Volcanoes National Park",
    category: "Culture",
    duration: 4,
    price: 95000,
    group_size: 6,
    rating: 5.0,
    featured: false,
    image: "/packages/rwanda.webp",
    short_description: "Land of a Thousand Hills, Kigali Memorial, cultural villages, and Volcanoes mountain scenery.",
    description: "Immerse yourself in Rwanda's remarkable heritage, clean capital city Kigali, Iby'Iwacu cultural village dances, and the dramatic Virunga volcanic mountain range.",
    inclusions: [
      "4x4 safari cruiser transport with professional driver guide",
      "3 nights premium lodge accommodation in Kigali and Musanze",
      "Kigali Genocide Memorial & City tour",
      "Iby'Iwacu Cultural Village experience with traditional drumming",
      "All meals and drinking water during safari"
    ],
    exclusions: [
      "Gorilla trekking permit ($1,500 if requested)",
      "International flights and Rwanda visa",
      "Tips and personal expenses"
    ],
    itinerary: [
      ["Day 1", "Arrival in Kigali", "Airport pickup, Kigali city tour, visit Genocide Memorial, transfer to hotel."],
      ["Day 2", "Kigali to Volcanoes National Park", "Scenic drive through rolling green hills to Musanze, afternoon visit to twin lakes Burera and Ruhondo."],
      ["Day 3", "Cultural Village & Nature Trek", "Full day cultural immersion at Iby'Iwacu Cultural Village, traditional dance, archery, and herbal medicine demonstration."],
      ["Day 4", "Musanze to Kigali & Departure", "Morning visit to local artisan markets, return drive to Kigali, and transfer to airport."]
    ]
  }
];

const ALL_DESTINATIONS = [
  { id: "dest-mara", name: "Maasai Mara", slug: "maasai-mara", image: "/photos/lion.webp", description: "World-famous Great Migration & Big Five game drives." },
  { id: "dest-zanzibar", name: "Zanzibar", slug: "zanzibar", image: "/photos/zanzibar.webp", description: "White sand beaches, Stone Town culture & dhow cruises." },
  { id: "dest-amboseli", name: "Amboseli", slug: "amboseli", image: "/photos/amboseli.webp", description: "Majestic elephant herds under snow-capped Mt Kilimanjaro." },
  { id: "dest-serengeti", name: "Serengeti", slug: "serengeti", image: "/photos/jeep_safari.webp", description: "Endless savannah plains & legendary predator encounters." },
  { id: "dest-rift", name: "Great Rift Valley", slug: "rift-valley", image: "/photos/client_3.webp", description: "Geysers, flamingos & volcanic crater adventures." },
  { id: "dest-mombasa", name: "Mombasa", slug: "mombasa", image: "/photos/mombasa.webp", description: "Coastal beach paradise and Swahili heritage." },
  { id: "dest-malindi", name: "Malindi", slug: "malindi", image: "/photos/malindi.webp", description: "Tropical marine parks and golden sand shores." },
  { id: "dest-diani", name: "Diani", slug: "diani", image: "/photos/diani_1.jpg", description: "World-renowned white sand beaches and reef diving." },
  { id: "dest-tsavo", name: "Tsavo", slug: "tsavo", image: "/photos/tsavo_1.jpg", description: "Red elephant herds and vast rugged wilderness." },
  { id: "dest-sagana", name: "Sagana", slug: "sagana", image: "/photos/sagana_1.avif", description: "White water rafting and outdoor adrenaline adventures." },
  { id: "dest-lamu", name: "Lamu", slug: "lamu", image: "/photos/lamu.webp", description: "Unspoiled UNESCO Swahili island and dhow sailing." },
  { id: "dest-capetown", name: "Cape Town", slug: "cape-town", image: "/photos/capetown.webp", description: "Table Mountain, coastal peninsulas, and winelands." },
  { id: "dest-rwanda", name: "Rwanda", slug: "rwanda", image: "/packages/rwanda.webp", description: "Gorilla trekking in Volcanoes National Park." }
];

const ALL_UPCOMING = [
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

const ALL_GALLERY = [
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

async function migrate() {
  console.log("🚀 Starting Supreme Adventures Database Migration...\n");

  // 1. Migrate Tours
  console.log(`📦 Migrating ${ALL_TOURS.length} Tours / Packages...`);
  for (const tour of ALL_TOURS) {
    const { error } = await supabase.from("tours").upsert(tour, { onConflict: "slug" });
    if (error) {
      console.error(`  ❌ Failed to upsert tour "${tour.title}":`, error.message);
    } else {
      console.log(`  ✅ Upserted Tour: ${tour.title} (KES ${tour.price.toLocaleString()})`);
    }
  }

  // 2. Migrate Destinations
  console.log(`\n📦 Migrating ${ALL_DESTINATIONS.length} Destinations...`);
  for (const dest of ALL_DESTINATIONS) {
    const { error } = await supabase.from("destinations").upsert(dest, { onConflict: "slug" });
    if (error) {
      console.error(`  ❌ Failed to upsert destination "${dest.name}":`, error.message);
    } else {
      console.log(`  ✅ Upserted Destination: ${dest.name}`);
    }
  }

  // 3. Migrate Upcoming Events
  console.log(`\n📦 Migrating ${ALL_UPCOMING.length} Upcoming Events...`);
  for (const up of ALL_UPCOMING) {
    const { error } = await supabase.from("upcoming").upsert(up, { onConflict: "id" });
    if (error) {
      console.error(`  ❌ Failed to upsert upcoming "${up.title}":`, error.message);
    } else {
      console.log(`  ✅ Upserted Upcoming: ${up.title}`);
    }
  }

  // 4. Migrate Gallery
  console.log(`\n📦 Migrating ${ALL_GALLERY.length} Gallery Photos...`);
  for (const g of ALL_GALLERY) {
    const { error } = await supabase.from("gallery").upsert(g, { onConflict: "id" });
    if (error) {
      console.error(`  ❌ Failed to upsert gallery "${g.place}":`, error.message);
    } else {
      console.log(`  ✅ Upserted Gallery: ${g.place}`);
    }
  }

  console.log("\n🎉 Database Migration Completed Successfully!");
}

migrate().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
