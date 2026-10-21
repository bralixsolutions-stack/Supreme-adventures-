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
    price: 525,
    currency: "$",
    duration: "4 Days",
    category: "Safari",
    image: "/supreme_packages/packages/mara.jpg" 
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
    price: 370,
    currency: "$",
    duration: "3 Days",
    category: "Wildlife Safari",
    image: "/supreme_packages/packages/tsavo.jpg" 
  },
  {
    id: "pkg-amboseli",
    destination: "Amboseli",
    title: "Amboseli Elephant Paradise Safari",
    tagline: "Majestic elephant herds roaming open savannah under snow-capped Mount Kilimanjaro.",
    price: 370,
    currency: "$",
    duration: "3 Days",
    category: "Wildlife Safari",
    image: "/supreme_packages/packages/amboseli.jpg" 
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
    id: "tanzania",
    title: "Jamhuri Weekend Tanzania: Moshi & Arusha",
    subtitle: "3 Days 2 Nights Moshi, Arusha, Kilasiya Water Fall & Kikuletwa Hot Springs",
    location: "Moshi & Arusha, Tanzania",
    date: "11th to 13th Dec 2026",
    price: 19000,
    category: "Culture",
    image: "/supreme_packages/tanzania_1.jpeg", 
    description: "Celebrate Jamhuri Weekend exploring Tanzania's vibrant culture and hidden gems. Soak in the crystal-clear Kikuletwa Hot Springs with natural fish massage, hike to scenic Kilasiya Water Falls, and explore the bustling streets and rich heritage of Moshi and Arusha.",
    inclusions: [
      "3 Days transport in a comfortable tour bus",
      "2 Nights hotel accommodation (2 people per room / 2 beds)",
      "Meals on Half Board basis",
      "Kilasiya Water Fall excursion",
      "Entry fee at Kikuletwa Hot Springs",
      "Natural fish massage",
      "Moshi & Arusha city tour",
      "Arusha Cultural Heritage tour",
      "Professional photography",
      "Complimentary mineral water"
    ],
    exclusions: [
      "Single room supplement (Ksh 8,000)",
      "Drinks (alcoholic & soft drinks)",
      "En route lunch & personal items",
      "Yellow fever certificate & border documents"
    ]
  },
  {
    id: "mombasa",
    title: "Parents & Kids Edition Mombasa Holiday Deal",
    subtitle: "3 Days 2 Nights Coastal Family Getaway with SGR / Flight, Marine Tour & Villa Stay",
    location: "Mombasa, Kenya",
    date: "03rd to 06th Dec 2026",
    price: 24500,
    category: "Beach",
    image: "/supreme_packages/mombasa.jpeg",
    description: "An extraordinary beach escape tailored for families! Enjoy 3 days and 2 nights of coastal sun and fun with return SGR or Flight transfers, villa accommodation with private pool access, glass-bottom boat tour, marine park snorkelling, and team-building games for parents and kids.",
    inclusions: [
      "Return SGR transport (or Flight + SGR option)",
      "2 Nights accommodation (per person sharing)",
      "Meals on Half Board",
      "SGR station transfers in Mombasa",
      "Marine Park tour",
      "Glass-bottom boat ride & snorkelling",
      "Team building facilitation",
      "Professional photography",
      "Access to villa amenities including swimming pool",
      "Mineral drinking water"
    ],
    exclusions: [
      "Haller park entry (Ksh 1,600 with return transport)",
      "Wild Waters entry (Ksh 2,500 with return transport)",
      "Personal expenses and drinks not mentioned"
    ]
  },
  {
    id: "Uganda Nyege",
    title: "Uganda Nyege Nyege Festival",
    subtitle: "4 Days 3 Nights Overland Party, Source of the Nile & Live Music Festival",
    location: "Jinja, Uganda",
    date: "18th - 22nd Nov 2026",
    price: 27500,
    category: "Overland Truck Party",
    image: "/supreme_packages/uganda_1.jpeg", 
    description: "Embark on an epic 4-day overland journey to Jinja for East Africa's biggest music and arts celebration. Experience high-energy overland truck road trips, scenic camping by the Nile, a boat cruise to the Source of the Nile, Jinja bridge tour, and non-stop music stages.",
    inclusions: [
      "Transport in a custom overland safari truck",
      "3 Nights camping accommodation",
      "Meals on Half Board",
      "Second Nile Bridge tour",
      "Entrance fee to the Source of The Nile",
      "Boat ride to the Source of The Nile",
      "Drinking water",
      "Professional photography",
      "Birthday cake for November celebrants",
      "Uganda road usage fee & COMESA charges"
    ],
    exclusions: [
      "Festival entrance ticket",
      "Water slide & bungee jumping",
      "Alcoholic beverages & personal lunch",
      "Yellow fever certificate & border travel permits"
    ]
  },
  {
    id: "up-rwanda-vuka",
    title: "Vuka Mwaka Rwanda New Year Celebration",
    subtitle: "7 Days Tour: Kigali, Nyungwe Canopy Walk, King's Palace & Lake Kivu",
    location: "Kigali & Lake Kivu, Rwanda",
    date: "27th Dec 2026 to 2nd Jan 2027",
    price: 68000,
    category: "Culture",
    image: "/supreme_packages/Rwanda Vuka Mwaka.jpg",
    description: "Ring in the New Year with an unforgettable cross-border adventure through the Land of a Thousand Hills! Visit Kigali city landmarks, pay tribute at Kigali Genocide Memorial, tour King's Palace in Nyanza, cross the heights of Nyungwe Forest Canopy Walk, relax at Lake Kivu hot springs, and explore vibrant Kimironko market.",
    inclusions: [
      "Return transport from Nairobi",
      "Rwanda Parliament & Kigali city tour",
      "Kigali Genocide Memorial & Convention Centre",
      "King's Palace Nyanza tour",
      "Nyungwe Forest canopy walkway excursion",
      "Boat ride at Lake Kivu & hot springs visit",
      "Kimironko market shopping experience",
      "Meals on Half Board (Dinner & Breakfast)",
      "All ground transfers within Rwanda",
      "Hotel accommodation (2 pax sharing per room)"
    ],
    exclusions: [
      "Personal expenses, lunches & extra beverages",
      "Yellow fever certificate & passport/temporary permit fees"
    ]
  },
  {
    id: "up-capetown-experience",
    title: "Cape Town Staycation",
    subtitle: "7 Days 6 Nights Table Mountain, Boulders Beach Penguins, Wine Tasting & Sunset Yacht Cruise",
    location: "Cape Town, South Africa",
    date: "16th-23rd Nov 2026 / 21st-28th Dec 2026",
    price: 185000,
    category: "Safari",
    image: "/supreme_packages/CapeTown SA.jpg", 
    description: "Experience the ultimate South African holiday in the Mother City! Fly with TAAG Airlines and immerse yourself in 7 days and 6 nights of wonder: ascend Table Mountain by cable car, sunset at Signal Hill, tour colorful Bo-Kaap and Camps Bay, hang out with Boulders Beach penguins, drive along Chapman's Peak, indulge in wine tasting, and cruise the Atlantic on a luxury sunset yacht.",
    inclusions: [
      "Return air tickets via TAAG Airlines",
      "Airport to hotel transfers in Cape Town",
      "6 Nights hotel accommodation (per person sharing)",
      "Daily breakfast",
      "Signal Hill sunset watch & Cape Town city tour",
      "Red Bus hop-on hop-off city tour",
      "Table Mountain cable car ride",
      "Constantia / Stellenbosch wine tasting",
      "Bo-Kaap cultural heritage tour",
      "Camps Bay scenic coastal visit",
      "Boulders Beach penguin colony entry",
      "Chapman's Peak scenic coastal drive",
      "Luxury Atlantic sunset yacht cruise"
    ],
    exclusions: [
      "South African visa fees",
      "Lunches, dinners, and drinks not specified",
      "Personal expenses and optional excursions"
    ]
  },
  {
    id: "up-supreme-csr",
    title: "Supreme Adventures CSR - Estel Children's Home",
    subtitle: "Community Outreach & Charity Support Day in Kayole",
    location: "Estel Children's Home, Kayole, Nairobi",
    date: "Sunday, 31st October 2026",
    price: 0,
    category: "Culture",
    image: "/supreme_packages/Supreme CSR.jpg",
    description: "Join hands with the Supreme Adventures family as we give back to the community at Estel Children's Home in Kayole. Spend meaningful time with the children through mentorship and games, and contribute vital supplies to support their daily living and education.",
    inclusions: [
      "Volunteer coordination & community meetup",
      "Mentorship sessions & games with the children",
      "Official Supreme Adventures CSR participation"
    ],
    exclusions: [
      "Voluntary donations: Foodstuff, Toiletries, Stationaries, Groceries, Bedsheets, Hygiene items"
    ]
  },
  {
    id: "up-mt-kenya-conservancy",
    title: "Mt Kenya Conservancy Family Experience",
    subtitle: "Full Day Wildlife Tour: Mountain Bongos, Animal Orphanage, Equator & Games",
    location: "Mount Kenya Conservancy, Nanyuki",
    date: "Sunday, 13th December 2026",
    price: 3600,
    category: "Safari",
    image: "/supreme_packages/mtkenya.jpeg",
    description: "An exciting family day trip to Mount Kenya Conservancy and Wildlife Orphanage! Encounter rare endangered Mountain Bongos, cheetahs, lions, rhinos, hyenas, llamas, elands, colobus monkeys, ostriches, reticulated giraffes, and diverse bird species. Enjoy an equator crossing tour, sumptuous lunch, family games, and epic photography.",
    inclusions: [
      "Return transport to and fro Nairobi",
      "Entry fees to Mount Kenya Conservancy & Animal Orphanage",
      "Professional tour guide fee",
      "Sumptuous lunch with fresh juice",
      "Equator crossing landmark visit",
      "Epic group & portrait photography",
      "Family-oriented games & networking"
    ],
    exclusions: [
      "Snacks and drinks outside the provided lunch",
      "Tips and personal gratuities"
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
    price: 525,
    currency: "$",
    groupSize: 7,
    rating: 5.0,
    featured: true,
    image: "/supreme_packages/packages/mara.jpg",
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
    id: "pkg-tsavo-safari",
    slug: "3-days-tsavo-safari-expedition",
    title: "3 Days Tsavo National Park Safari",
    destination: "Tsavo",
    location: "Tsavo East & West",
    category: "Safari",
    duration: 3,
    price: 370,
    currency: "$",
    groupSize: 7,
    rating: 4.8,
    featured: true,
    image: "/supreme_packages/packages/tsavo.jpg",
    shortDescription: "Untamed landscapes, famous red elephants, Mzima Springs, and rugged volcanic scenery.",
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
    ]
  },
  {
    id: "pkg-amboseli-safari",
    slug: "3-days-amboseli-safari-kilimanjaro",
    title: "3 Days Amboseli National Park Safari",
    destination: "Amboseli",
    location: "Amboseli National Park",
    category: "Safari",
    duration: 3,
    price: 370,
    currency: "$",
    groupSize: 7,
    rating: 4.8,
    featured: true,
    image: "/supreme_packages/packages/amboseli.jpg",
    shortDescription: "Majestic elephant herds roaming open savannah under snow-capped Mount Kilimanjaro.",
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