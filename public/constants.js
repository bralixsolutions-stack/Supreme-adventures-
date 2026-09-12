/**
 * Supreme Adventures - Master Constants & Static Data Store
 * All packages, upcoming tours, gallery photos & destinations stored locally.
 * No database queries needed — ensures instant 0ms search and 100% uptime.
 */

// ==========================================================================
// 1. HERO PACKAGES (Top Slideshow)
// ==========================================================================
const HERO_PACKAGES = [
  {
    id: "pkg-mara",
    destination: "Maasai Mara",
    title: "Maasai Mara Wildlife Safari",
    tagline: "Witness the Great Wildebeest Migration & the Big Five in Kenya's legendary game reserve.",
    price: 68000,
    duration: "4 Days",
    category: "Safari",
    image: "/photos/wild_beest.webp"
  },
  {
    id: "pkg-zanzibar",
    destination: "Zanzibar",
    title: "Zanzibar Tropical Beach Paradise",
    tagline: "Pristine white sand beaches, turquoise Indian Ocean waters & historic Stone Town charm.",
    price: 85000,
    duration: "5 Days",
    category: "Beach & Culture",
    image: "/photos/zanzibar.webp"
  },
  {
    id: "pkg-tsavo",
    destination: "Tsavo",
    title: "Into the Wild Tsavo Expedition",
    tagline: "Where untamed landscapes meet unforgettable red elephant encounters.",
    price: 48000,
    duration: "3 Days",
    category: "Wildlife Safari",
    image: "/photos/tsavo_1.jpg"
  },
  {
    id: "pkg-sagana",
    destination: "Sagana",
    title: "Sagana Extreme Adrenaline Adventure",
    tagline: "Get outdoors. Get your adrenaline going with white water rafting & ziplining.",
    price: 18000,
    duration: "2 Days",
    category: "Adventure",
    image: "/photos/sagana_1.avif"
  },
  {
    id: "pkg-mombasa",
    destination: "Mombasa",
    title: "Coastal Swahili Getaway",
    tagline: "Sun-drenched palm beaches, ancient Fort Jesus & authentic Swahili hospitality.",
    price: 25350,
    duration: "3 Days",
    category: "Beach",
    image: "/photos/mombasa.webp"
  }
];

// ==========================================================================
// 2. SEARCH DESTINATIONS & TRIP TYPES
// ==========================================================================
const DESTINATIONS = [
  "All destinations",
  "Maasai Mara",
  "Diani",
  "Mombasa",
  "Malindi",
  "Watamu",
  "Amboseli",
  "Tsavo",
  "Sagana",
  "Lamu",
  "Zanzibar",
  "Tanzania",
  "Samburu",
  "Ethiopia",
  "Rwanda",
  "Cape Town",
  "Malaysia"
];

const TRIP_TYPES = [
  "All types",
  "Safari",
  "Beach",
  "Culture",
  "Wildlife",
  "Adventure",
  "Overland Truck Party"
];

// ==========================================================================
// 3. UPCOMING TOURS & EVENTS (Images stored in /supreme_packages)
// ==========================================================================
const UPCOMING_TOURS = [
  {
    id: "up-watamu-offer",
    title: "The One Watamu Bay - Pay 2 Nights Stay 3",
    subtitle: "Special SGR holiday offer with return train tickets & shared transfers",
    location: "Watamu & Malindi",
    date: "Valid 21st Sep to 20th Dec 2026",
    price: 26000,
    category: "Beach",
    image: "/supreme_packages/The One Watamu Bay Offer.jpg",
    description: "Enjoy an unforgettable beach getaway at The One Watamu Bay. Pay for 2 nights and get your 3rd night free on Half Board or Full Board, including return SGR train tickets and shared transfers.",
    inclusions: [
      "Return SGR tickets",
      "Return shared transfers",
      "Meals on selected meal plan (HB/FB)",
      "3 Nights accommodation (per person sharing)",
      "Access to hotel amenities & private beach"
    ],
    exclusions: [
      "Flight rates & SGR upgrade (available upon request)",
      "Personal expenses and anything not mentioned"
    ]
  },
  {
    id: "up-samburu-overland",
    title: "Samburu x Buffalo Springs Overland Safari",
    subtitle: "2 Days 1 Night Adrenaline Overland Safari Truck Adventure",
    location: "Samburu & Buffalo Springs",
    date: "10th to 11th October 2026",
    price: 11000,
    category: "Overland Truck Party",
    image: "/supreme_packages/Samburu Overland Safari.jpg",
    description: "Join the legendary Supreme Overland Safari truck party to Samburu and Buffalo Springs. Enjoy game drives, swimming in the natural spring pools, campfire bonfires, and professional photography.",
    inclusions: [
      "Transport in custom overland truck",
      "Camping accommodation (2 sharing tent, single @ 2k extra)",
      "Park entry fees & game drives",
      "Meals on half board (Dinner & Breakfast)",
      "Natural swimming at Buffalo Springs",
      "Refill mineral water",
      "Bonfire night entertainment",
      "Professional photography"
    ],
    exclusions: [
      "Drinks (bottled water, soft drinks & alcohol)",
      "En route lunch",
      "Personal items not mentioned"
    ]
  },
  {
    id: "up-tanzania-arusha",
    title: "Tanzania Moshi & Arusha - October Edition",
    subtitle: "Kikuletwa Hot Springs, Marangu Waterfalls & Cultural Experience",
    location: "Moshi & Arusha, Tanzania",
    date: "9th to 11th October 2026 (Fri - Sun)",
    price: 19000,
    category: "Culture",
    image: "/supreme_packages/TZ Moshi & Arusha October.jpg",
    description: "Explore northern Tanzania across 3 thrilling days. Take a dip in the crystal turquoise Kikuletwa Hot Springs, visit Marangu Waterfalls at the base of Mt Kilimanjaro, and experience Arusha's rich culture.",
    inclusions: [
      "3 Days overland / bus transport",
      "2 Nights hotel accommodation",
      "Meals on Half Board",
      "Entry fee to Kikuletwa Hot Springs",
      "Entry to Marangu Waterfalls",
      "Arusha Cultural Heritage Centre visit",
      "COMESA charges & cross-border facilitation",
      "Mineral water & fish massage",
      "Professional photography"
    ],
    exclusions: [
      "Yellow fever certificate",
      "Temporary permit or passport charges"
    ]
  },
  {
    id: "up-ethiopia-odyssey",
    title: "Ethiopian Grand Odyssey Overland Truck Trip",
    subtitle: "10 Days 9 Nights Epic Road Trip from Nairobi to Addis Ababa",
    location: "Ethiopia (Nairobi to Addis Ababa)",
    date: "21st Sept to 1st Oct 2026",
    price: 75000,
    category: "Overland Truck Party",
    image: "/supreme_packages/Ethiopian Grand Odyssey.jpg",
    description: "The ultimate East Africa expedition! Journey through southern Ethiopia's Ommo Valley, Hawassa lake nightlife, hot springs at Wondo Genet, Shashamene, and cultural tours in Addis Ababa.",
    inclusions: [
      "Transport in fully equipped overland truck (charging ports & fridge)",
      "Hotel accommodation per person sharing",
      "2 meals a day (Breakfast & Dinner)",
      "Wondo Genet & Teddy Dan's entry",
      "Roots gallery entry fee",
      "Addis Ababa city tour & leather market",
      "Lake Hawassa boat ride & nightlife",
      "Professional Ethiopian tour guide on board"
    ],
    exclusions: [
      "Lunch & personal drinks",
      "Tips & gratuities",
      "Medical insurance & visa fees for non-residents"
    ]
  },
  {
    id: "up-malaysia-shopping",
    title: "Kuala Lumpur Malaysia Shopping Tour",
    subtitle: "6 Days 4 Nights International Shopping & Sightseeing Experience",
    location: "Kuala Lumpur, Malaysia",
    date: "14th to 19th October 2026",
    price: 175000,
    category: "Adventure",
    image: "/supreme_packages/Malaysia Shopping Tour 1.jpg",
    description: "Experience the vibrant modern city of Kuala Lumpur. Featuring KLCC Observation Tower, Genting Highlands cable car ride, Chin Swee Caves Temple, Batu Caves, and guided shopping sprees.",
    inclusions: [
      "Return flight tickets",
      "Return airport transfers in Malaysia",
      "4 Nights accommodation on Bed & Breakfast",
      "Kuala Lumpur city tour",
      "KLCC Observation Tower ticket",
      "Genting Highlands cable car tour",
      "Chin Swee Caves Temple tour",
      "Batu Caves tour & shopping guide",
      "Professional driver guide & tourism tax"
    ],
    exclusions: [
      "Extra personal activities & shopping expenses"
    ]
  },
  {
    id: "up-rwanda-vuka",
    title: "Rwanda Vuka Mwaka New Year Celebration",
    subtitle: "Ring in the New Year with Rwandan culture, Kigali & Lake Kivu",
    location: "Kigali & Lake Kivu, Rwanda",
    date: "27th Dec 2026 to 2nd Jan 2027",
    price: 68000,
    category: "Culture",
    image: "/supreme_packages/Rwanda Vuka Mwaka.jpg",
    description: "Celebrate New Year's Eve in the clean, green hills of Rwanda! Visit Kigali City, the Genocide Memorial, King's Palace at Nyanza, Nyungwe Canopy Walk, and enjoy boat rides on scenic Lake Kivu.",
    inclusions: [
      "Return transport from Nairobi",
      "Rwanda Parliament & Kigali city tour",
      "Kigali Genocide Memorial & Convention Centre",
      "King's Palace Nyanza & Nyungwe Canopy Walk",
      "Boat ride at Lake Kivu & Hot Springs visit",
      "Kimironko market tour",
      "Meals on Half Board (Dinner & Breakfast)",
      "All transfers in Rwanda & twin/double accommodation"
    ],
    exclusions: [
      "Personal expenses & border documents"
    ]
  },
  {
    id: "up-capetown-staycation",
    title: "Cape Town South Africa Staycation",
    subtitle: "Table Mountain, Peninsula Tour, Wine Tasting & Sunset Yacht Cruise",
    location: "Cape Town, South Africa",
    date: "16th-23rd Nov & 21st-28th Dec 2026",
    price: 185000,
    category: "Safari",
    image: "/supreme_packages/CapeTown SA.jpg",
    description: "Discover the breathtaking beauty of South Africa's Mother City. Ascend Table Mountain, taste world-class wines, meet the Boulders Beach penguins, and cruise the Atlantic on a luxury sunset yacht.",
    inclusions: [
      "Return air tickets (TAAG Airlines)",
      "Airport to hotel transfers",
      "6 Nights accommodation on per person sharing",
      "Daily breakfast",
      "Signal Hill sunset watch & Cape Town city tour",
      "Redbus city tour experience",
      "Table Mountain cable ride",
      "Wine tasting & Bo-Kaap tour",
      "Camps Bay & Boulders Beach penguin visit",
      "Chapmans Peak drive & Sunset yacht cruise"
    ],
    exclusions: [
      "Visa fees & lunches/dinners not mentioned"
    ]
  },
  {
    id: "up-zanzibar-getaway",
    title: "Zanzibar Cultural & Ocean Beach Getaway",
    subtitle: "Tropical white sand beaches, Stone Town culture & Dhow sailing",
    location: "Zanzibar",
    date: "14th to 18th October 2026",
    price: 85000,
    category: "Beach",
    image: "/supreme_packages/zanzibar.webp",
    description: "Relax on Zanzibar's turquoise coast with sunset dhow cruises, historic Stone Town walking tours, and authentic Swahili spice farm excursions.",
    inclusions: [
      "Return flight / ferry transfers",
      "Beach resort accommodation",
      "Stone Town walking tour & Spice tour",
      "Sunset dhow cruise with refreshments",
      "Daily breakfast & dinner"
    ],
    exclusions: [
      "Tips and personal expenses"
    ]
  },
  {
    id: "up-supreme-csr",
    title: "Supreme Adventures CSR - Estel Children's Home",
    subtitle: "Community outreach and charity support day in Kayole",
    location: "Estel Children's Home, Kayole, Nairobi",
    date: "Sunday, 31st October 2026",
    price: 0,
    category: "Culture",
    image: "/supreme_packages/Supreme CSR.jpg",
    description: "Join the Supreme Adventures family as we give back to our community at Estel Children's Home. Support with foodstuff, toiletries, stationery, and hygiene items for children.",
    inclusions: [
      "Group coordination and meetup",
      "Mentorship activities with the children",
      "Official Supreme Adventures volunteer certificate"
    ],
    exclusions: [
      "Voluntary donations of goods and groceries"
    ]
  }
];

// ==========================================================================
// 4. PACKAGES & TOURS DATA (Images stored in /supreme_packages/packages)
//    Used by Search Bar, Tour Grid, and View Tour details modal.
// ==========================================================================
const TOURS = [
  {
    id: "pkg-diani-experience",
    slug: "diani-beach-experience-bora-bora",
    title: "3 Days Diani Beach Experience & Bora Bora Animal Park",
    destination: "Diani",
    location: "Diani Beach, South Coast",
    category: "Beach",
    duration: 3,
    price: 18500,
    groupSize: 8,
    rating: 4.9,
    featured: true,
    image: "/supreme_packages/packages/Diani Beach Experience November.jpg",
    shortDescription: "Experience Diani's white sands, Ali Barbours Cave restaurant, zebra feeding at Bora Bora park, and Kongo River sunset.",
    description: "An action-packed 3-day tropical escape to Kenya's top beach destination. Travel via comfortable SGR train, unwind in private luxury villas, feed giraffes and zebras at Bora Bora Wildlife Park, dine at the iconic cave restaurant, and watch magical sunsets at Kongo River.",
    inclusions: [
      "Transport via SGR train (return)",
      "Shared coastal transfers",
      "2 Nights villa accommodation",
      "Meals on Half Board (Breakfast & Dinner)",
      "Access to villa swimming pools & amenities",
      "Diani Beach relaxation & swimming",
      "Visit to Ali Barbours Cave restaurant",
      "Bora Bora animal park entry & animal feeding",
      "Kongo River sunset viewing experience"
    ],
    exclusions: [
      "Glass boat tour to Robinson Island (KES 800)",
      "Canoe at Kongo River sunset chase (KES 700)",
      "Personal drinks and items not specified"
    ]
  },
  {
    id: "pkg-diani-sea-lodge",
    slug: "diani-sea-lodge-papillon-lagoon",
    title: "3 Days Diani Sea Lodge & Papillon Lagoon All Inclusive",
    destination: "Diani",
    location: "Diani Beach",
    category: "Beach",
    duration: 3,
    price: 32000,
    groupSize: 8,
    rating: 4.9,
    featured: true,
    image: "/supreme_packages/packages/Diani Sea Lodge + Papillon.png",
    shortDescription: "All-inclusive tropical beachfront resort escape with unlimited dining, cocktails, swimming pools, and SGR train tickets.",
    description: "Indulge in premium all-inclusive luxury at Diani Sea Lodge or Papillon Lagoon Reef. Wake up to the soothing sounds of the Indian Ocean, savor unlimited buffet dining and drinks, lounge by pristine pools, and stroll along miles of pure white sand.",
    inclusions: [
      "Return SGR train tickets",
      "Return private resort transfers",
      "All-Inclusive meal plan (Breakfast, Lunch, Dinner, Snacks & Drinks)",
      "Resort accommodation in tropical ocean rooms",
      "Full access to resort swimming pools & private beach",
      "Children under 3 years stay FREE"
    ],
    exclusions: [
      "Water sports equipment hire",
      "Personal laundry & tips"
    ]
  },
  {
    id: "pkg-sun-n-sand",
    slug: "sun-n-sand-beach-resort-special",
    title: "4 Days Sun n Sand Beach Resort Special (Pay 2 Stay 3)",
    destination: "Mombasa",
    location: "Kikambala, North Coast Mombasa",
    category: "Beach",
    duration: 4,
    price: 20700,
    groupSize: 8,
    rating: 4.8,
    featured: true,
    image: "/supreme_packages/packages/Sun n Sand Beach Resort Pay 2 stay 3 nights.jpg",
    shortDescription: "Special promotion: Pay for 2 nights and get your 3rd night free with SGR train tickets and resort transfers included.",
    description: "Escape to the peaceful palms of Kikambala at Sun n Sand Beach Resort. Benefit from our exclusive Pay 2 Stay 3 promotion with 3 full nights of accommodation, half board dining, Olympic-sized swimming pools, and beach volleyball.",
    inclusions: [
      "3 Nights hotel accommodation",
      "Meals on Half Board (Breakfast & Dinner)",
      "Return SGR train economy tickets",
      "Return SGR shared transfers",
      "Full access to Olympic swimming pool & resort amenities"
    ],
    exclusions: [
      "Excursions outside the resort",
      "Beverages not included in the meal plan"
    ]
  },
  {
    id: "pkg-malindi-watamu",
    slug: "malindi-watamu-coastal-getaway",
    title: "3 Days Diamonds Malindi & The One Watamu Luxury Getaway",
    destination: "Malindi",
    location: "Malindi & Watamu Coast",
    category: "Beach",
    duration: 3,
    price: 21000,
    groupSize: 8,
    rating: 4.9,
    featured: true,
    image: "/supreme_packages/packages/Malindi & Watamu Getaway.jpg",
    shortDescription: "Luxury coastal stay at Diamonds Malindi or The One Watamu with SGR transfers, fine dining, and golden beaches.",
    description: "Discover the golden sands and Italian-influenced culture of Malindi and Watamu. Choose between Diamonds Malindi or The One Watamu, complete with return SGR transfers, oceanfront dining, and optional marine park dolphin excursions.",
    inclusions: [
      "Return SGR tickets",
      "Return resort transfers",
      "Accommodation on chosen meal plan (Half Board / Full Board)",
      "Access to hotel amenities & pools",
      "Children below 3 years stay free"
    ],
    exclusions: [
      "Marine park snorkeling & boat excursion",
      "Personal expenses"
    ]
  },
  {
    id: "pkg-mombasa-continental",
    slug: "mombasa-continental-resort-holiday",
    title: "3 Days Mombasa Continental Resort Coastal Holiday",
    destination: "Mombasa",
    location: "Shanzu Beach, Mombasa",
    category: "Beach",
    duration: 3,
    price: 25350,
    groupSize: 8,
    rating: 4.8,
    featured: false,
    image: "/supreme_packages/packages/Mombasa Continental Resort.jpg",
    shortDescription: "Sun-drenched getaway on Shanzu beach with beachfront swimming pools, authentic Swahili dining, and SGR train tickets.",
    description: "Relax in style at Mombasa Continental Resort located on serene Shanzu Beach. Perfect for couples, families, and friends looking for a peaceful beach break with panoramic ocean views and warm coastal hospitality.",
    inclusions: [
      "Return SGR economy tickets",
      "Return station transfers",
      "2 Nights accommodation on Half Board",
      "Access to resort amenities & gardens",
      "Kids under 3 stay free"
    ],
    exclusions: [
      "Watersports & scuba diving",
      "Alcoholic beverages"
    ]
  },
  {
    id: "pkg-mara-migration",
    slug: "maasai-mara-wildlife-migration-safari",
    title: "4 Days Maasai Mara Great Migration & Big Five Safari",
    destination: "Maasai Mara",
    location: "Maasai Mara National Reserve",
    category: "Safari",
    duration: 4,
    price: 68000,
    groupSize: 7,
    rating: 5.0,
    featured: true,
    image: "/supreme_packages/packages/wildbeest.webp",
    shortDescription: "Witness the legendary Great Wildebeest Migration, Mara River crossings, and Big Five predator action.",
    description: "The crown jewel of African safaris. Spend 4 unforgettable days tracking lions, leopards, cheetahs, and elephants across the vast savannah of Maasai Mara with our expert safari guides in custom 4x4 Land Cruisers.",
    inclusions: [
      "Transport in custom 4x4 Safari Land Cruiser",
      "Maasai Mara park entrance fees",
      "Services of a professional safari guide",
      "3 Nights luxury safari camp / lodge accommodation",
      "Full Board meals throughout the safari",
      "Comprehensive daily game drives"
    ],
    exclusions: [
      "Hot air balloon safari (optional)",
      "Maasai cultural village visit fee",
      "Tips & personal drinks"
    ]
  },
  
  {
    id: "pkg-corporate-teambuilding",
    slug: "corporate-teambuilding-group-retreat",
    title: "Corporate Team Building & Group Retreat Packages",
    destination: "All destinations",
    location: "Kenya & Worldwide",
    category: "Adventure",
    duration: 3,
    price: 25000,
    groupSize: 20,
    rating: 5.0,
    featured: false,
    image: "/supreme_packages/packages/WhatsApp Image 2026-09-11 at 07.57.58.jpeg",
    shortDescription: "Tailor-made team building retreats, certified facilitators, group transport, conference facilities & photography.",
    description: "Energize and unite your organization with Supreme Adventures' signature corporate packages. We handle seamless end-to-end logistics, engaging team challenges, resort bookings, and professional media coverage.",
    inclusions: [
      "Certified team building facilitators & event coordinators",
      "High-energy team building games & props",
      "Group overland / luxury coach transport",
      "Resort accommodation & conference halls",
      "Full board catering & coffee breaks",
      "Professional drone photography & highlight reel"
    ],
    exclusions: [
      "Company branded merchandise (available upon request)"
    ]
  },
  {
    id: "pkg-custom-safari-planning",
    slug: "custom-safari-worldwide-travel-planning",
    title: "Custom Tailored Safari & Holiday Getaway",
    destination: "All destinations",
    location: "East Africa & Worldwide",
    category: "Safari",
    duration: 5,
    price: 50000,
    groupSize: 6,
    rating: 5.0,
    featured: false,
    image: "/supreme_packages/packages/WhatsApp Image 2026-09-11 at 07.58.06.jpg",
    shortDescription: "Your adventure, our passion! Fully customized itineraries tailored to your dates, preferences, and budget.",
    description: "Not every traveller wants the same holiday. Supreme Adventures crafts completely customized trips from private bush safaris and coastal honeymoons to international vacations with 24/7 personalized support.",
    inclusions: [
      "Dedicated safari specialist & trip planner",
      "Custom day-by-day itinerary tailored to you",
      "4x4 vehicle & flight coordination",
      "Vetted luxury lodge or resort bookings",
      "24/7 dedicated traveler support"
    ],
    exclusions: [
      "International visa fees & insurance"
    ]
  }
];

// ==========================================================================
// 5. PHOTO GALLERY ITEMS (Categories: all, safari, adventure, clients)
// Authentic travel photos stored in /gallery
// ==========================================================================
const GALLERY_PHOTOS = [
  {
    id: "g-01",
    place: "Lake Baringo Pier",
    caption: "Traveler Smiles & Scenic Lakeside Shores",
    category: "clients",
    tag: "Happy Travelers",
    image: "/gallery/SON09269.jpg",
    featured: "tall"
  },
  {
    id: "g-02",
    place: "Lake Baringo",
    caption: "Boat Excursion & Marine Bird Watching",
    category: "adventure",
    tag: "Lake Safari",
    image: "/gallery/SON09060.jpg"
  },
  {
    id: "g-03",
    place: "Great Rift Valley Waters",
    caption: "Balance, Serenity & Nature Escapes",
    category: "adventure",
    tag: "Rift Valley",
    image: "/gallery/SON09294.jpg"
  },
  {
    id: "g-04",
    place: "Lake Bogoria Flamingo Waters",
    caption: "Proud Supreme Adventures Traveler & Flamingo Haven",
    category: "clients",
    tag: "Supreme Family",
    image: "/gallery/SUP_3265.jpg",
    featured: "tall"
  },
  {
    id: "g-05",
    place: "Overland Safari Truck",
    caption: "Scenic Road Trips & Unforgettable Good Energy",
    category: "clients",
    tag: "Road Trip Vibe",
    image: "/gallery/SON09502.jpg"
  },
  {
    id: "g-06",
    place: "Lake Bogoria Hot Springs",
    caption: "Exploring Geysers, Fumaroles & Natural Steam Jets",
    category: "adventure",
    tag: "Geo Wonders",
    image: "/gallery/SON09535.jpg"
  },
  {
    id: "g-07",
    place: "Lake Bogoria Shoreline",
    caption: "Flamingo Paradise with the Supreme Adventures Crew",
    category: "clients",
    tag: "Traveler Memories",
    image: "/gallery/SON09691.jpg",
    featured: "wide"
  },
  {
    id: "g-08",
    place: "Supreme Overland Truck",
    caption: "Built for the Wild — Ready for Any Route",
    category: "safari",
    tag: "Overland Truck",
    image: "/gallery/SUP_2767.jpg"
  },
  {
    id: "g-09",
    place: "Safari Expedition Meetup",
    caption: "Squad Camaraderie & Unstoppable Group Safaris",
    category: "clients",
    tag: "Group Safari",
    image: "/gallery/SUP_2817.jpg",
    featured: "wide"
  },
  {
    id: "g-10",
    place: "Lake Baringo Waters",
    caption: "Sunshine, Wind & Fresh Horizons on the Boat Excursion",
    category: "adventure",
    tag: "Marine Expedition",
    image: "/gallery/SUP_3005.jpg"
  },
  {
    id: "g-11",
    place: "Supreme Overland Rig",
    caption: "Step Aboard for the Journey of a Lifetime",
    category: "clients",
    tag: "Overland Journey",
    image: "/gallery/SUP_2876.jpg",
    featured: "tall"
  },
  {
    id: "g-12",
    place: "Lake Bogoria Nature Trail",
    caption: "Friendship & Lifelong Memories on the Road",
    category: "clients",
    tag: "Group Joining",
    image: "/gallery/SUP_3154.jpg",
    featured: "wide"
  },
  {
    id: "g-13",
    place: "Rift Valley Escarpment",
    caption: "Genuine Laughter & Real Travel Moments",
    category: "clients",
    tag: "Good Vibes",
    image: "/gallery/SUP_3363.jpg"
  },
  {
    id: "g-14",
    place: "Great Rift Valley Overland",
    caption: "Pure Freedom & Untamed Adventures Across Kenya",
    category: "adventure",
    tag: "Wilderness Calling",
    image: "/gallery/SON09520.jpg",
    featured: "tall"
  },
  {
    id: "g-15",
    place: "Lake Bogoria National Reserve",
    caption: "Rift Valley Mountain Ridges & Pink Flamingo Haven",
    category: "safari",
    tag: "Scenic Landscapes",
    image: "/gallery/lake_bogoria.jpg",
    featured: "wide"
  }
];

// ==========================================================================
// 6. POPULAR DESTINATIONS (3D Parabolic Dome Carousel)
// ==========================================================================
const POPULAR_DESTINATIONS = [
  { id: "dest-mara", name: "Maasai Mara", slug: "maasai-mara", image: "/photos/lion.webp", description: "World-famous Great Migration & Big Five game drives." },
  { id: "dest-zanzibar", name: "Zanzibar", slug: "zanzibar", image: "/photos/zanzibar.webp", description: "White sand beaches, Stone Town culture & dhow cruises." },
  { id: "dest-rift", name: "Lake Bogoria", slug: "naivasha", image: "/gallery/lake_bogoria.jpg", description: "Lake Baringo & Bogoria hot springs adventure" },
  { id: "dest-sagana", name: "Sagana", slug: "sagana", image: "/photos/sagana_1.avif", description: "White water rafting and outdoor adrenaline adventures." },
  { id: "dest-serengeti", name: "Serengeti", slug: "serengeti", image: "/photos/serengeti.jpg", description: "Endless savannah plains & legendary predator encounters." },
  { id: "dest-diani", name: "Diani Beach", slug: "diani", image: "/photos/diani_1.jpg", description: "World-renowned white sand beaches and reef diving." },
  { id: "dest-amboseli", name: "Amboseli", slug: "amboseli", image: "/photos/amboseli.webp", description: "Majestic elephant herds under snow-capped Mt Kilimanjaro." },
  { id: "dest-tsavo", name: "Tsavo", slug: "tsavo", image: "/photos/tsavo_1.jpg", description: "Red elephant herds and vast rugged wilderness." },
  { id: "dest-mombasa", name: "Mombasa", slug: "mombasa", image: "/photos/mombasa.webp", description: "Coastal beach paradise and Swahili heritage." },
  { id: "dest-lamu", name: "Lamu", slug: "lamu", image: "/photos/lamu.webp", description: "Unspoiled UNESCO Swahili island and dhow sailing." }
];