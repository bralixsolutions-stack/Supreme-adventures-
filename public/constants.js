/**
 * Supreme Adventures - Hero Packages & Destinations Data
 * Packages included: Malindi, Zanzibar, Mombasa, Lamu, Maasai Mara, Amboseli
 */

const HERO_PACKAGES = [
  {
    id: "pkg-mara",
    destination: "Maasai Mara",
    title: "Maasai Mara Wildlife Safari",
    tagline: "Witness the Great Wildebeest Migration & the Big Five in Kenya's legendary game reserve.",
    price: 520,
    duration: "4 Days",
    category: "Safari",
    image: "/photos/wild_beest.webp"
  },
  {
    id: "pkg-zanzibar",
    destination: "Zanzibar",
    title: "Zanzibar Tropical Beach Paradise",
    tagline: "Pristine white sand beaches, turquoise Indian Ocean waters & historic Stone Town charm.",
    price: 650,
    duration: "5 Days",
    category: "Beach & Culture",
    image: "/photos/zanzibar.webp" 
  },
  {
    id: "pkg-mombasa",
    destination: "Mombasa",
    title: "Coastal Getaway",
    tagline: "Sun-drenched palm beaches, ancient Fort Jesus & rich authentic Swahili hospitality.",
    price: 450,
    duration: "3 Days",
    category: "Coastal Beach",
    image: "/photos/mombasa.webp" 
  },
  {
    id: "pkg-malindi",
    destination: "Malindi",
    title: "Malindi Marine Adventure",
    tagline: "Vibrant coral reefs, golden sands & relaxing coastal ocean breezes.",
    price: 480,
    duration: "4 Days",
    category: "Marine & Beach",
    image: "/photos/malindi.webp"
  },
  {
    id: "pkg-lamu",
    destination: "Lamu",
    title: "Lamu Island Cultural Escape",
    tagline: "Traditional dhow sailing cruises, UNESCO World Heritage architecture & tranquil island life.",
    price: 590,
    duration: "4 Days",
    category: "Island Culture",
    image: "/photos/lamu.webp"
  },
  {
    id: "pkg-amboseli",
    destination: "Amboseli",
    title: "Amboseli Elephant Kingdom",
    tagline: "Majestic elephant herds roaming below the snow-capped peak of Mount Kilimanjaro.",
    price: 390,
    duration: "3 Days",
    category: "Wildlife Safari",
    image: "/photos/amboseli.webp"
  }
];

const DESTINATIONS = [
  "All destinations",
  "Malindi",
  "Zanzibar",
  "Mombasa",
  "Lamu",
  "Maasai Mara",
  "Amboseli",
  "Cape Town",
  "Ethiopia",
  "Rwanda",
  "Burundi",
  "Tanzania",
  "Uganda",
  "Diani"
];

const TRIP_TYPES = [
  "All types",
  "Safari",
  "Beach",
  "Culture",
  "Wildlife",
  "Overland Truck Party"
];

const UPCOMING_TOURS = [
  {
    id: "up-fally",
    title: "Lakes Baringo & Bogoria ",
    subtitle: "Overland Truck party adventure",
    location: "Lake Baringo & Bogoria",
    date: "From 05th Sep, 2026",
    price: 350,
    category: "Overland Truck Party", 
    image: "/packages/lake_Bogoria.webp", 
    description: "Discover the stunning landscapes of Lake Baringo and Lake Bogoria on this adventure-filled tour."
  },
  {
    id: "up-strathmore",
    title: "Rwanda Cultural Safari ",
    subtitle: "Get a chance to visit the diverse Rwandan culture",
    location: "Rwanda",
    date: "From 05th Sep, 2026",
    price: 150,
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
    price: 520,
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
    price: 520,
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
    price: 650,
    category: "Beach & Culture",
    image: "/packages/zanzibar.webp", 
    description: "Relax on Zanzibar's turquoise coast with sunset dhow cruises and authentic Swahili spice tours."
  }
];