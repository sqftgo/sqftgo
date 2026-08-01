export interface WeddingVenue {
  id: string;
  name: string;
  type: string;
  capacity: string;
  pricePerEvent: string;
  image: string;
  vibe: string;
  highlights: string[];
  description: string;
}

export interface WeddingProperty {
  id: string;
  title: string;
  propertyType: string;
  price: string;
  specs: string;
  location: string;
  image: string;
  features: string[];
  description: string;
}

export interface Destination {
  name: string;
  title: string;
  desc: string;
  image: string;
  tag: string;
  vibe: string;
  investmentIndex: string;
  topLocalities: string[];
  averagePrice: string;
  agentName: string;
  agentPhone: string;
  history: string;
  weddingVenues: WeddingVenue[];
  uniqueWeddingProperties: WeddingProperty[];
}

export const DESTINATIONS: Destination[] = [
  // Rajasthan
  {
    name: "Udaipur",
    title: "The City of Lakes",
    desc: "Known for floating marble palaces, historic Mewar arches, and serene lakeside sunsets.",
    image: "/udaipur_destination.png",
    tag: "Rajasthan",
    vibe: "Royal Lakefront",
    investmentIndex: "9.4/10",
    topLocalities: ["Lake Palace Road", "Panchwati", "Shobhagpura", "Fatehsagar Lake"],
    averagePrice: "₹45 Lakhs - ₹8.5 Crores",
    agentName: "Chandra Shekhar Mewar",
    agentPhone: "+91 94140 88221",
    history: "Udaipur was founded in 1553 by Maharana Udai Singh II as the new capital of the Mewar Kingdom. The city is famous for its stunning lakes, heritage palaces, and traditional Mewari arches.",
    weddingVenues: [
      {
        id: "udr-v1",
        name: "Jagmandir Island Palace",
        type: "Lakeside Island Palace",
        capacity: "500 - 1,200 Guests",
        pricePerEvent: "₹45 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop",
        vibe: "Floating Palace Magic",
        highlights: ["Floating Mandap Setup", "Grand Boat Procession Arrival", "Illuminated Marble Courtyards"],
        description: "A 17th-century marble palace built on an island in Lake Pichola, renowned worldwide for hosting ultra-luxurious royal destination weddings."
      },
      {
        id: "udr-v2",
        name: "Chundavada Fort & Palace",
        type: "Aravali Fort Palace",
        capacity: "300 - 800 Guests",
        pricePerEvent: "₹32 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop",
        vibe: "Hilltop Heritage",
        highlights: ["Panoramic Lake & Fort Views", "Heritage Royal Suites", "Traditional Mewari Sheesh Mahal"],
        description: "Situated atop the Aravali hills, this fortified palace features terraced mandap lawns and traditional Mewari regal hospitality."
      },
      {
        id: "udr-v3",
        name: "Fateh Garh Heritage Resort",
        type: "Sanctuary Hill Resort",
        capacity: "400 - 900 Guests",
        pricePerEvent: "₹38 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop",
        vibe: "Regal Hillside Sunset",
        highlights: ["360° Lake & City Views", "Solar-Powered Heritage Architecture", "Vintage Car Fleet for Groom Entry"],
        description: "Perched on a hilltop overlooking Udaipur's lakes, Fateh Garh offers authentic heritage aesthetics with sustainable modern luxury."
      }
    ],
    uniqueWeddingProperties: [
      {
        id: "udr-p1",
        title: "The Royal Lakefront Haveli Estate",
        propertyType: "Heritage Haveli Estate",
        price: "₹14.5 Crores",
        specs: "12 Royal Suites • 2.8 Acres • 1,000 Capacity Lawns",
        location: "Lake Pichola Outer Ring, Udaipur",
        image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=800&auto=format&fit=crop",
        features: ["Private Boat Dock & Jetty", "Marble Amphitheater", "Commercial Banquet Kitchen", "Helipad Access"],
        description: "Sprawling 12-suite royal haveli featuring carved marble courtyards, private lakefront jetty, and expansive lawns customized for destination weddings."
      },
      {
        id: "udr-p2",
        title: "Mewar Palace View Fort Villa",
        propertyType: "Fortress Villa",
        price: "₹9.8 Crores",
        specs: "8 Suites • 1.6 Acres • 600 Capacity Lawns",
        location: "Badi Lake Road, Udaipur",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
        features: ["Infinity Pool Facing Hills", "Private Sangeet Hall", "Traditional Jharokhas", "RERA Approved"],
        description: "A private hilltop fort villa designed for intimate royal weddings, boasting panoramic water views and hand-carved sandstone architecture."
      }
    ]
  },
  {
    name: "Jaipur",
    title: "The Pink City",
    desc: "Home of the majestic Hawa Mahal, block printers, royal fort gates, and bustling bazaars.",
    image: "/jaipur_destination.png",
    tag: "Rajasthan",
    vibe: "Fort Heritage",
    investmentIndex: "9.6/10",
    topLocalities: ["C-Scheme", "Malviya Nagar", "Vaishali Nagar", "Mansarovar"],
    averagePrice: "₹35 Lakhs - ₹12 Crores",
    agentName: "Aditya Vardhan Sharma",
    agentPhone: "+91 98290 12345",
    history: "Jaipur was founded in 1727 by Maharaja Sawai Jai Singh II. It is India's first planned city, renowned for its color-coded pink architecture and astronomical observatories like Jantar Mantar.",
    weddingVenues: [
      {
        id: "jpr-v1",
        name: "Rambagh Palace Lawns",
        type: "Royal Palace Estate",
        capacity: "600 - 2,000 Guests",
        pricePerEvent: "₹65 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop",
        vibe: "Imperial Royalty",
        highlights: ["Historic Peacock Lawns", "Elephant & Horse Baraat Welcomes", "Royal Rajput Cuisine"],
        description: "The former residence of the Maharaja of Jaipur, offering sprawling manicured gardens and opulent palace ballrooms for high-profile weddings."
      },
      {
        id: "jpr-v2",
        name: "Samode Palace & Havelis",
        type: "Heritage Fort Palace",
        capacity: "400 - 1,000 Guests",
        pricePerEvent: "₹42 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop",
        vibe: "Classic Rajput Romance",
        highlights: ["Famous Sheesh Mahal (Hall of Mirrors)", "Terraced Poolside Lawns", "Traditional Folk Performances"],
        description: "A 475-year-old palace nestled in the Aravali hills, celebrated for intricate frescoed walls, mirror-work halls, and romantic courtyard weddings."
      }
    ],
    uniqueWeddingProperties: [
      {
        id: "jpr-p1",
        title: "The Royal Pink City Courtyard Estate",
        propertyType: "Palace Mansion",
        price: "₹18.5 Crores",
        specs: "16 Royal Suites • 4.2 Acres • 1,500 Guest Lawns",
        location: "Kukas Palace Corridor, Jaipur",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop",
        features: ["Helipad", "Centrally Air-Conditioned Banquet Hall", "Ornate Frescoed Courtyard", "Guard Towers"],
        description: "Palatial 16-suite heritage estate equipped with grand banquet lawns, private helipad, and majestic arches designed specifically for royal weddings."
      },
      {
        id: "jpr-p2",
        title: "Amer Foothills Heritage Residence",
        propertyType: "Heritage Mansion",
        price: "₹11.2 Crores",
        specs: "10 Suites • 2.2 Acres • 800 Guest Lawns",
        location: "Amer Fort Road, Jaipur",
        image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=800&auto=format&fit=crop",
        features: ["Direct Amer Fort Sunset Views", "Private Amphitheater", "Spa & Wellness Wing", "Ample Guest Parking"],
        description: "Luxury heritage residence offering front-row views of Amer Fort, complete with private courtyard mandaps and guest accommodation suites."
      }
    ]
  },
  {
    name: "Jaisalmer",
    title: "The Golden City",
    desc: "Discover ancient sandstone forts emerging from the Thar desert and yellow dune camps.",
    image: "/jaisalmer_destination.png",
    tag: "Rajasthan",
    vibe: "Desert Sandstone",
    investmentIndex: "8.8/10",
    topLocalities: ["Kuldhara", "Sam Sand Dunes", "Fort Road", "Dedansar"],
    averagePrice: "₹25 Lakhs - ₹4 Crores",
    agentName: "Sumer Singh Bhati",
    agentPhone: "+91 98292 22222",
    history: "Jaisalmer, meaning the Hill Fort of Jaisal, was founded in 1156 AD by the Rajput ruler Rawal Jaisal. The fort stands as a living heritage monument housing a quarter of the city's population.",
    weddingVenues: [
      {
        id: "jsl-v1",
        name: "Suryagarh Golden Palace",
        type: "Fortress Oasis Resort",
        capacity: "500 - 1,500 Guests",
        pricePerEvent: "₹52 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800&auto=format&fit=crop",
        vibe: "Golden Sandstone Glamour",
        highlights: ["Desert Sunset Mandap", "Camel Procession Welcomes", "Open-Air Courtyard Celebrations"],
        description: "An architectural masterpiece in yellow sandstone that seamlessly blends fort heritage with desert luxury for unforgettable destination weddings."
      }
    ],
    uniqueWeddingProperties: [
      {
        id: "jsl-p1",
        title: "Thar Golden Sandstone Palace Estate",
        propertyType: "Oasis Palace Estate",
        price: "₹12.0 Crores",
        specs: "10 Suites • 5.0 Acres • 1,200 Guest Lawns",
        location: "Sam Sand Dunes Highway, Jaisalmer",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop",
        features: ["Private Sand Dune Arena", "Yellow Sandstone Jali Work", "Royal Tent Pavilion Grounds", "Borewell & Solar Grid"],
        description: "Exclusive golden sandstone palace property featuring desert sand dune arenas, sprawling lawns, and luxury guest quarters for royal desert nuptials."
      }
    ]
  },
  {
    name: "Jodhpur",
    title: "The Blue City",
    desc: "Experience the imposing Mehrangarh Fort and vast azure neighborhoods stretching below.",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan",
    vibe: "Imperial Azure",
    investmentIndex: "9.1/10",
    topLocalities: ["Sardarpura", "Shastri Nagar", "Ratanada", "Pal Road"],
    averagePrice: "₹30 Lakhs - ₹7 Crores",
    agentName: "Gajendra Singh Rathore",
    agentPhone: "+91 99887 76655",
    history: "Jodhpur was founded in 1459 by Rao Jodha, a chief of the Rathore clan. The city is celebrated for its majestic blue-walled houses and the towering Mehrangarh Fort that dominates the skyline.",
    weddingVenues: [
      {
        id: "jdh-v1",
        name: "Umaid Bhawan Palace Gardens",
        type: "Royal Heritage Palace",
        capacity: "500 - 1,800 Guests",
        pricePerEvent: "₹70 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1564507592208-02754ba318dc?q=80&w=800&auto=format&fit=crop",
        vibe: "Art-Deco Royal Luxury",
        highlights: ["Baronial Palace Lawns", "Vintage Car Escorts", "Champagne Receptions at Sunset"],
        description: "One of the world's largest private residences, offering regal golden-sandstone palace gardens overlooking Mehrangarh Fort."
      }
    ],
    uniqueWeddingProperties: [
      {
        id: "jdh-p1",
        title: "Mehrangarh Vista Royal Haveli",
        propertyType: "Heritage Haveli",
        price: "₹10.5 Crores",
        specs: "9 Suites • 1.8 Acres • 700 Guest Lawns",
        location: "Ratanada Palace Zone, Jodhpur",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop",
        features: ["Unobstructed Fort Views", "Rooftop Banquet Terrace", "Ornate Carved Pillars", "Private Swimming Pool"],
        description: "Historic Rathore haveli featuring uninterrupted vistas of Mehrangarh Fort, a grand rooftop celebration terrace, and luxury suites for wedding guests."
      }
    ]
  },
  {
    name: "Pali",
    title: "Heritage & Craft Hub",
    desc: "Famous for its textile industries, traditional craftsmanship, and historic temples.",
    image: "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan",
    vibe: "Heritage & Craft",
    investmentIndex: "8.5/10",
    topLocalities: ["Industrial Area Housing", "Suraj Pole", "Marwar Junction Area"],
    averagePrice: "₹15 Lakhs - ₹3.5 Crores",
    agentName: "Vijay Sood Kothari",
    agentPhone: "+91 94140 12345",
    history: "Pali, located on the banks of the Bandi River, has been a historic trading post since ancient times, renowned for its textile mills and proximity to famous heritage temples like Ranakpur.",
    weddingVenues: [
      {
        id: "pli-v1",
        name: "Lawa Sardar Samand Palace",
        type: "Heritage Lake Lodge",
        capacity: "250 - 600 Guests",
        pricePerEvent: "₹22 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop",
        vibe: "Lakeside Marwar Heritage",
        highlights: ["Wildlife Sanctuary Backdrop", "Private Lakefront Mandap", "Marwari Culinary Feasts"],
        description: "A heritage hunting lodge of Marwar rulers turned wedding sanctuary, situated alongside a tranquil lake surrounded by nature."
      }
    ],
    uniqueWeddingProperties: [
      {
        id: "pli-p1",
        title: "Marwar Heritage Estate & Farm",
        propertyType: "Heritage Farmhouse Estate",
        price: "₹4.8 Crores",
        specs: "6 Suites • 3.5 Acres • 500 Guest Lawns",
        location: "Ranakpur Road, Pali",
        image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&auto=format&fit=crop",
        features: ["Organic Orchard Lawns", "Stone Courtyard", "Guest Bungalows"],
        description: "Serene heritage farmhouse estate surrounded by lush orchards, ideal for intimate eco-luxury destination weddings."
      }
    ]
  },
  {
    name: "Alwar",
    title: "Expressway Gateway",
    desc: "Historic gateway of Rajasthan near Delhi NCR with palaces and proximity to Sariska National Park.",
    image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan",
    vibe: "Expressway Proximity",
    investmentIndex: "8.9/10",
    topLocalities: ["Manu Marg", "NEB Housing Board", "Shivaji Park"],
    averagePrice: "₹20 Lakhs - ₹4.5 Crores",
    agentName: "Rajesh Kumar Singh",
    agentPhone: "+91 94140 12345",
    history: "Alwar was founded in 1770 by Pratap Singh. It is home to magnificent heritage structures like the City Palace, Moosi Maharani ki Chhatri, and the tiger sanctuary of Sariska.",
    weddingVenues: [
      {
        id: "alw-v1",
        name: "Neemrana Fort-Palace",
        type: "15th-Century Hill Fort",
        capacity: "300 - 800 Guests",
        pricePerEvent: "₹38 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop",
        vibe: "Tiered Citadel Royalty",
        highlights: ["14-Tiered Fort Structure", "Hanging Gardens & Amphitheater", "Delhi NCR Expressway Convenience"],
        description: "A 15th-century heritage citadel featuring stepped garden terraces, open-air amphitheaters, and royal wedding backdrop."
      }
    ],
    uniqueWeddingProperties: [
      {
        id: "alw-p1",
        title: "Sariska Valley Fort Resort Property",
        propertyType: "Fort Resort Villa",
        price: "₹7.5 Crores",
        specs: "10 Suites • 3.0 Acres • 800 Guest Lawns",
        location: "Delhi-Mumbai Expressway Corridor, Alwar",
        image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800&auto=format&fit=crop",
        features: ["Expressway Proximity", "Grand Lawn Pavilion", "Private Cottages"],
        description: "Modernized fort-resort property offering quick connectivity to Delhi NCR, featuring 10 luxury suites and celebration grounds."
      }
    ]
  },
  {
    name: "Pushkar",
    title: "The Holy City",
    desc: "Sacred lakes, spiritual ghats, and the world-famous camel fair surrounded by hills.",
    image: "https://images.unsplash.com/photo-1582201942988-13e60e4556ee?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan",
    vibe: "Spiritual Heritage",
    investmentIndex: "8.9/10",
    topLocalities: ["Pushkar Lake", "Varaha Ghat", "Choti Basti", "Budha Pushkar"],
    averagePrice: "₹20 Lakhs - ₹3.5 Crores",
    agentName: "Pandit Ram Sharma",
    agentPhone: "+91 94143 33333",
    history: "Pushkar is one of the oldest existing cities in India, mythical for having the only temple dedicated to Lord Brahma in the world. It centers around a holy lake with 52 bathing ghats.",
    weddingVenues: [
      {
        id: "psk-v1",
        name: "The Westin Pushkar Resort & Spa",
        type: "Luxury Desert Spa Resort",
        capacity: "400 - 1,200 Guests",
        pricePerEvent: "₹35 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop",
        vibe: "Sacred Oasis Luxury",
        highlights: ["Spiritual Vedic Mandap Ceremonies", "Private Villa Pools", "Massive Banquet Lawns"],
        description: "Nestled among the Aravalli hills, offering sacred Vedic wedding rituals combined with world-class resort amenities."
      }
    ],
    uniqueWeddingProperties: [
      {
        id: "psk-p1",
        title: "Aravalli Sacred Lakefront Estate",
        propertyType: "Spiritual Heritage Estate",
        price: "₹6.2 Crores",
        specs: "8 Suites • 2.0 Acres • 600 Guest Lawns",
        location: "Pushkar Bypass Road, Pushkar",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
        features: ["Vedic Ritual Pavilion", "Organic Herb Gardens", "Courtyard Mandap"],
        description: "Peaceful heritage estate combining traditional Marwari architecture with dedicated spaces for sacred wedding mandaps."
      }
    ]
  },
  {
    name: "Kota",
    title: "River & Education Hub",
    desc: "Situated on the banks of the Chambal River, known for its educational prominence and gardens.",
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan",
    vibe: "Riverside Commerce",
    investmentIndex: "8.9/10",
    topLocalities: ["Talwandi", "Kunhari", "Rajeev Gandhi Nagar", "Vigyan Nagar"],
    averagePrice: "₹25 Lakhs - ₹4.5 Crores",
    agentName: "Devendra Jindal Verma",
    agentPhone: "+91 98888 77777",
    history: "Kota lies along the eastern bank of the Chambal River. Historically it was part of the Rajput kingdom of Bundi, and later became an independent state renowned for its grand gardens and palaces.",
    weddingVenues: [
      {
        id: "kta-v1",
        name: "Umed Bhawan Palace Kota",
        type: "Victorian-Rajput Palace",
        capacity: "350 - 900 Guests",
        pricePerEvent: "₹25 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop",
        vibe: "Riverside Victorian Heritage",
        highlights: ["Lush Royal Lawns", "High-Ceilinged Ballrooms", "Chambal River Breeze"],
        description: "Built in 1904, combining Victorian architecture with Indian courtly grandeur for dignified wedding receptions."
      }
    ],
    uniqueWeddingProperties: [
      {
        id: "kta-p1",
        title: "Chambal Riverside Palace Mansion",
        propertyType: "Riverside Estate",
        price: "₹5.5 Crores",
        specs: "7 Suites • 2.5 Acres • 700 Guest Lawns",
        location: "Chambal Riverfront Drive, Kota",
        image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=800&auto=format&fit=crop",
        features: ["Private River Pier", "Manicured Gardens", "Grand Entrance Gates"],
        description: "Riverfront mansion offering serene water views and generous lawn grounds for high-capacity weddings."
      }
    ]
  },
  {
    name: "Bikaner",
    title: "Desert Heritage",
    desc: "Renowned for its impressive Junagarh Fort, Karni Mata Temple, and vibrant desert culture.",
    image: "https://images.unsplash.com/photo-1667822938356-9b57bc820986?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan",
    vibe: "Traditional Desert",
    investmentIndex: "8.6/10",
    topLocalities: ["Jayanarayan Vyas Colony", "Sadul Ganj", "Rani Bazar", "Ganga Shahar"],
    averagePrice: "₹18 Lakhs - ₹3 Crores",
    agentName: "Vikram Chauhan Singh",
    agentPhone: "+91 98281 12233",
    history: "Bikaner was founded in 1488 by Rao Bika, a Rathore prince. The city is famous for its intricate red sandstone havelis, rich history, camel research farms, and Junagarh Fort.",
    weddingVenues: [
      {
        id: "bkn-v1",
        name: "Lallgarh Palace Lawns",
        type: "Red Sandstone Palace",
        capacity: "400 - 1,000 Guests",
        pricePerEvent: "₹28 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop",
        vibe: "Red Sandstone Grandeur",
        highlights: ["Intricate Carved Carvings", "Peacock Courtyards", "Authentic Bikaneri Sweets Banquet"],
        description: "Designed by Sir Swinton Jacob in Indo-Saracenic style with red sandstone lattice work, perfect for royal desert ceremonies."
      }
    ],
    uniqueWeddingProperties: [
      {
        id: "bkn-p1",
        title: "Junagarh Heritage Sandstone Haveli",
        propertyType: "Red Sandstone Haveli",
        price: "₹4.2 Crores",
        specs: "6 Suites • 1.5 Acres • 500 Guest Lawns",
        location: "Sadul Ganj Heritage Zone, Bikaner",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
        features: ["Carved Sandstone Facade", "Rooftop Sheesh Mahal", "Inner Courtyard Mandap"],
        description: "Authentic red sandstone haveli property ideal for boutique heritage weddings and intimate cultural receptions."
      }
    ]
  },
  {
    name: "Rajsamand",
    title: "Lakes & Marble",
    desc: "Famous for the massive Rajsamand Lake and its thriving marble production industry.",
    image: "https://images.unsplash.com/photo-1617653202545-930d9798817f?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan",
    vibe: "Industrial Mining",
    investmentIndex: "8.5/10",
    topLocalities: ["Kankroli", "Jalchakri", "Dwarkadheesh Colony", "Nathdwara Road"],
    averagePrice: "₹15 Lakhs - ₹2.8 Crores",
    agentName: "Abhinav Vyas Raj",
    agentPhone: "+91 98290 22222",
    history: "Rajsamand is named after the magnificent Rajsamand Lake, constructed by Maharana Raj Singh of Mewar in the 17th century. It is a major hub of Indian marble extraction and craftsmanship.",
    weddingVenues: [
      {
        id: "rjs-v1",
        name: "Nathdwara Royal Lakefront Grounds",
        type: "Lakefront Pilgrimage Resort",
        capacity: "300 - 800 Guests",
        pricePerEvent: "₹20 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop",
        vibe: "Marble Lakeside Serenity",
        highlights: ["Proximity to Shrinathji Temple", "White Marble Promenade Mandap", "Pure Vegetarian Feast Facilities"],
        description: "Situated on the banks of Rajsamand Lake, combining auspicious spiritual proximity with scenic white marble pavilions."
      }
    ],
    uniqueWeddingProperties: [
      {
        id: "rjs-p1",
        title: "White Marble Lakefront Palace Villa",
        propertyType: "Marble Villa Estate",
        price: "₹3.8 Crores",
        specs: "5 Suites • 2.0 Acres • 450 Guest Lawns",
        location: "Kankroli Lake View, Rajsamand",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop",
        features: ["Carved White Marble Arches", "Direct Lake View", "Private Prayer Pavilion"],
        description: "Exclusive villa crafted entirely from fine Makrana marble, featuring lakefront ceremony grounds."
      }
    ]
  },

  // Gujarat
  {
    name: "Ahmedabad",
    title: "Heritage City",
    desc: "India's first UNESCO World Heritage City, blending modern commerce with intricate architecture.",
    image: "https://images.unsplash.com/photo-1600150806193-01306b49233f?q=80&w=800&auto=format&fit=crop",
    tag: "Gujarat",
    vibe: "Urban Heritage",
    investmentIndex: "9.5/10",
    topLocalities: ["SG Highway", "Bodakdev", "Satellite", "Sindhu Bhavan Road"],
    averagePrice: "₹40 Lakhs - ₹10 Crores",
    agentName: "Parth Patel Shah",
    agentPhone: "+91 99112 99112",
    history: "Ahmedabad was founded in 1411 by Sultan Ahmed Shah. It developed into a leading textile center known as the 'Manchester of the East' and houses Mahatma Gandhi's historic Sabarmati Ashram.",
    weddingVenues: [
      {
        id: "amd-v1",
        name: "Sabarmati Riverfront Luxury Lawns",
        type: "Riverfront Celebration Complex",
        capacity: "800 - 3,000 Guests",
        pricePerEvent: "₹35 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop",
        vibe: "Modern Urban Grandeur",
        highlights: ["Vast Riverfront Lawn Space", "State-of-the-Art Sound & Lighting", "Valet Parking for 500+ Vehicles"],
        description: "Massive urban riverfront celebration grounds capable of accommodating grand Gujarati wedding celebrations and sangeet night galas."
      },
      {
        id: "amd-v2",
        name: "House of MG Heritage Courtyards",
        type: "1920s Heritage Mansion",
        capacity: "200 - 500 Guests",
        pricePerEvent: "₹22 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop",
        vibe: "Old World Textile Elegance",
        highlights: ["Intricate Pol Wooden Carvings", "Traditional Gujarati Thali Feasts", "Rooftop Lotus Pool Mandap"],
        description: "A stately 1924 heritage mansion in the heart of UNESCO heritage city, famous for intimate traditional weddings."
      }
    ],
    uniqueWeddingProperties: [
      {
        id: "amd-p1",
        title: "Sindhu Bhavan Royal Celebration Villa",
        propertyType: "Luxury Farmhouse Estate",
        price: "₹16.8 Crores",
        specs: "10 Suites • 3.0 Acres • 1,500 Guest Lawns",
        location: "Sindhu Bhavan Extension, Ahmedabad",
        image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=800&auto=format&fit=crop",
        features: ["2-Acre Manicured Lawns", "Commercial Kitchen Infrastructure", "Private Guest Bungalows", "High-End Security"],
        description: "Modern palatial villa estate on Sindhu Bhavan Extension featuring massive manicured lawns and luxury guest suites designed for destination weddings."
      }
    ]
  },
  {
    name: "Surat",
    title: "The Diamond City",
    desc: "A bustling commercial center renowned worldwide for its diamond cutting and textile industries.",
    image: "https://images.unsplash.com/photo-1624647963283-4a159fbe9066?q=80&w=800&auto=format&fit=crop",
    tag: "Gujarat",
    vibe: "Commercial Hub",
    investmentIndex: "9.3/10",
    topLocalities: ["Vesu", "Adajan", "Dumas Road", "Piplod"],
    averagePrice: "₹35 Lakhs - ₹8 Crores",
    agentName: "Harshil Mehta Kumar",
    agentPhone: "+91 98112 98112",
    history: "Surat was a major port of the Mughal empire and the British East India Company. It has evolved into one of the cleanest, fastest-growing economic capitals of Gujarat.",
    weddingVenues: [
      {
        id: "srt-v1",
        name: "Dumas Beachfront Royal Resort",
        type: "Beachfront Resort",
        capacity: "600 - 2,000 Guests",
        pricePerEvent: "₹32 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop",
        vibe: "Arabian Sea Sunset",
        highlights: ["Beachside Mandap Lawn", "Grand Crystal Ballroom", "Diamond Merchant Gala Setup"],
        description: "A premier coastal resort featuring expansive ocean-view lawns tailored for lavish diamond capital wedding celebrations."
      }
    ],
    uniqueWeddingProperties: [
      {
        id: "srt-p1",
        title: "Vesu Imperial Celebration Manor",
        propertyType: "Urban Mansion Estate",
        price: "₹13.5 Crores",
        specs: "8 Suites • 2.5 Acres • 1,200 Guest Lawns",
        location: "Vesu VIP Road, Surat",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop",
        features: ["Covered Glass Pavilion", "Private Swimming Pool", "Basement Guest Parking"],
        description: "Stately residence in ultra-prime Vesu equipped with celebration lawns, guest suites, and air-conditioned banquet facilities."
      }
    ]
  },
  {
    name: "Rajkot",
    title: "Industrial Hub",
    desc: "A rapidly growing city in Saurashtra, known for its manufacturing and vibrant culture.",
    image: "https://images.unsplash.com/photo-1598977123118-4e50bb6c469b?q=80&w=800&auto=format&fit=crop",
    tag: "Gujarat",
    vibe: "Manufacturing Base",
    investmentIndex: "8.9/10",
    topLocalities: ["Kalawad Road", "Yagnik Road", "Amin Marg", "University Road"],
    averagePrice: "₹20 Lakhs - ₹4.5 Crores",
    agentName: "Ketan Bhai Patel",
    agentPhone: "+91 98251 44444",
    history: "Rajkot was the former capital of the princely state of Saurashtra. It holds historical importance as the place where Mahatma Gandhi spent his childhood years at the Alfred High School.",
    weddingVenues: [
      {
        id: "raj-v1",
        name: "Saurashtra Heritage Club Grounds",
        type: "Heritage Club Estate",
        capacity: "500 - 1,500 Guests",
        pricePerEvent: "₹24 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop",
        vibe: "Saurashtra Regal Charm",
        highlights: ["Colonial Club Architecture", "Royal Kathiawadi Banquet", "Cricket Pitch Ground Space"],
        description: "Sprawling heritage club grounds providing classic Saurashtrian hospitality for high-capacity weddings."
      }
    ],
    uniqueWeddingProperties: [
      {
        id: "raj-p1",
        title: "Kalawad Road Royal Farm Villa",
        propertyType: "Luxury Farm Villa",
        price: "₹6.8 Crores",
        specs: "6 Suites • 3.0 Acres • 1,000 Guest Lawns",
        location: "Kalawad Road Corridor, Rajkot",
        image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&auto=format&fit=crop",
        features: ["3-Acre Green Lawns", "Private Sangeet Stage", "Caretaker Quarters"],
        description: "Expansive farm villa estate along Kalawad Road offering generous open lawns ideal for wedding functions."
      }
    ]
  },
  {
    name: "Gandhinagar",
    title: "Planned Green Capital",
    desc: "The tree-lined planned capital of Gujarat, housing the high-tech GIFT City financial zone.",
    image: "https://images.unsplash.com/photo-1619546276316-aa637576080b?q=80&w=800&auto=format&fit=crop",
    tag: "Gujarat",
    vibe: "Planned Greenery",
    investmentIndex: "9.2/10",
    topLocalities: ["Sector 21", "Gift City", "Sector 30"],
    averagePrice: "₹40 Lakhs - ₹9 Crores",
    agentName: "Ketan Bhai Patel",
    agentPhone: "+91 98251 44444",
    history: "Gandhinagar, named after Mahatma Gandhi, was established in 1970 as the capital of Gujarat. Designed by H.K. Mewada, it is one of India's greenest and most systematically laid-out cities.",
    weddingVenues: [
      {
        id: "gnd-v1",
        name: "GIFT City Riverside Resort & Convention",
        type: "Modern Financial District Resort",
        capacity: "500 - 2,000 Guests",
        pricePerEvent: "₹38 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop",
        vibe: "Futuristic Green Luxury",
        highlights: ["Eco-Friendly Helipad", "River View Lawns", "International Guest Suites"],
        description: "State-of-the-art green resort adjacent to GIFT City, offering modern luxury convention spaces and riverfront lawns."
      }
    ],
    uniqueWeddingProperties: [
      {
        id: "gnd-p1",
        title: "GIFT Corridor Green Villa Estate",
        propertyType: "Modern Villa Estate",
        price: "₹11.5 Crores",
        specs: "7 Suites • 2.5 Acres • 900 Guest Lawns",
        location: "Koba Circle - GIFT City Road, Gandhinagar",
        image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop",
        features: ["Wide Tree-Lined Driveway", "Solar Power Grid", "Indoor Air-Conditioned Banquet"],
        description: "Ultra-modern villa estate situated in Gandhinagar's green corridor with dedicated event lawns and private suites."
      }
    ]
  },
  {
    name: "Kutch",
    title: "Salt Desert Oasis",
    desc: "Vast white salt desert plains, historical Bhuj palaces, and scenic coastal port towns.",
    image: "https://images.unsplash.com/photo-1627894142171-ec59a72dfef2?q=80&w=800&auto=format&fit=crop",
    tag: "Gujarat",
    vibe: "Salt Desert Oasis",
    investmentIndex: "8.6/10",
    topLocalities: ["Bhuj", "Mandvi Port Area", "Anjar"],
    averagePrice: "₹15 Lakhs - ₹3.5 Crores",
    agentName: "Parth Patel Shah",
    agentPhone: "+91 99112 99112",
    history: "Kutch is the largest district in India, historically a self-governed state famous for the Great Rann of Kutch (a seasonal salt desert), exquisite handicrafts, and Kutchi heritage.",
    weddingVenues: [
      {
        id: "ktc-v1",
        name: "White Rann Desert Tent Resort",
        type: "White Salt Desert Arena",
        capacity: "300 - 1,000 Guests",
        pricePerEvent: "₹30 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800&auto=format&fit=crop",
        vibe: "Full Moon White Desert Magic",
        highlights: ["Full Moon Night Mandap", "Kutchi Folk Music & Dance", "Luxury Swiss Tents"],
        description: "Unforgettable destination wedding setting on the glistening white salt desert of Kutch under starry skies."
      }
    ],
    uniqueWeddingProperties: [
      {
        id: "ktc-p1",
        title: "Mandvi Beachfront Heritage Villa",
        propertyType: "Beachfront Villa Estate",
        price: "₹5.2 Crores",
        specs: "6 Suites • 2.8 Acres • 600 Guest Lawns",
        location: "Mandvi Beach Road, Kutch",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop",
        features: ["Private Beach Access", "Kutchi Woodwork Carvings", "Windmill Vistas"],
        description: "Coastal villa estate in historic Mandvi offering private beach frontage and serene Arabian Sea backdrop."
      }
    ]
  },
  {
    name: "Anand",
    title: "Milk Capital of India",
    desc: "The milk capital of India and prominent educational hub with clean residential suburbs.",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop",
    tag: "Gujarat",
    vibe: "Cooperative Capital",
    investmentIndex: "8.7/10",
    topLocalities: ["Vallabh Vidyanagar", "Amul Dairy Road", "Karamsad"],
    averagePrice: "₹25 Lakhs - ₹5 Crores",
    agentName: "Harshil Mehta Kumar",
    agentPhone: "+91 98112 98112",
    history: "Anand is globally renowned for hosting the head office of AMUL dairy and triggering the White Revolution (Operation Flood). It is also a thriving educational and agricultural hub.",
    weddingVenues: [
      {
        id: "and-v1",
        name: "Vidyanagar Country Club Lawns",
        type: "Suburban Golf & Country Club",
        capacity: "400 - 1,200 Guests",
        pricePerEvent: "₹22 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=800&auto=format&fit=crop",
        vibe: "Green Suburb Elegance",
        highlights: ["Golf Course Views", "Organic Catering Facilities", "Spacious Guest Rooms"],
        description: "Tranquil golf club resort setting offering lush lawns and pristine suburban air for wedding events."
      }
    ],
    uniqueWeddingProperties: [
      {
        id: "and-p1",
        title: "Karamsad Heritage Ancestral Farmhouse",
        propertyType: "Heritage Farmhouse",
        price: "₹4.5 Crores",
        specs: "5 Suites • 2.2 Acres • 500 Guest Lawns",
        location: "Karamsad Suburb, Anand",
        image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=800&auto=format&fit=crop",
        features: ["Traditional Courtyard", "Manicured Lawns", "Fruit Orchards"],
        description: "Classic Gujarati farmhouse estate featuring authentic courtyard architecture and green celebration lawns."
      }
    ]
  },

  // Himachal Pradesh
  {
    name: "Shimla",
    title: "Queen of Hills",
    desc: "The historic summer capital, featuring colonial architecture and breathtaking mountain views.",
    image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=800&auto=format&fit=crop",
    tag: "Himachal Pradesh",
    vibe: "Colonial Peak",
    investmentIndex: "9.0/10",
    topLocalities: ["The Mall Road", "Chotta Shimla", "Sanjauli", "Kasumpti"],
    averagePrice: "₹50 Lakhs - ₹6 Crores",
    agentName: "Rohan Verma Kaundal",
    agentPhone: "+91 98765 12345",
    history: "Shimla was declared the summer capital of British India in 1864. It is famous for the Kalka-Shimla toy train railway (UNESCO Heritage) and classic Tudor-style architecture.",
    weddingVenues: [
      {
        id: "sml-v1",
        name: "Wildflower Hall Mountain Lawns",
        type: "Luxury Himalayan Mountain Resort",
        capacity: "200 - 600 Guests",
        pricePerEvent: "₹38 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop",
        vibe: "Cedar Forest Romance",
        highlights: ["8,250 ft Snow Peak Panorama", "Open-Air Heated Jacuzzi Deck", "Colonial Ballroom"],
        description: "Perched 8,250 feet up among pine and cedar forests, offering fairytale mountain mandap setups and colonial luxury."
      },
      {
        id: "sml-v2",
        name: "Woodville Palace Estate",
        type: "Colonial Heritage Manor",
        capacity: "250 - 500 Guests",
        pricePerEvent: "₹24 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=800&auto=format&fit=crop",
        vibe: "Tudor Era Elegance",
        highlights: ["Vintage Rose Gardens", "Hollywood & Bollywood Heritage", "Fireplace Lounge Suites"],
        description: "Former country residence of the Raja of Jubbal, famous for vintage rose garden ceremonies and pine-clad hillsides."
      }
    ],
    uniqueWeddingProperties: [
      {
        id: "sml-p1",
        title: "Cedar Peak Himalayan Mountain Manor",
        propertyType: "Mountain Estate Villa",
        price: "₹8.5 Crores",
        specs: "7 Alpine Suites • 1.8 Acres • 400 Guest Lawns",
        location: "Mashobra Heights, Shimla",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop",
        features: ["360° Snow Peak Vistas", "Private Pine Forest Path", "Helipad Access"],
        description: "Luxury alpine manor in Mashobra featuring unobstructed Himalayan snow-peak views, private pine forest, and terraced mandap lawns."
      }
    ]
  },
  {
    name: "Dharamshala",
    title: "Spiritual Valleys",
    desc: "Home to the Dalai Lama, offering serene pine forests and vibrant Tibetan culture.",
    image: "https://images.unsplash.com/photo-1605640840469-87a1d1b31a89?q=80&w=800&auto=format&fit=crop",
    tag: "Himachal Pradesh",
    vibe: "Zen Retreat",
    investmentIndex: "8.8/10",
    topLocalities: ["McLeod Ganj", "Dharamkot", "Sidhbari", "Naddi"],
    averagePrice: "₹45 Lakhs - ₹5 Crores",
    agentName: "Tenzin Gyatso Negi",
    agentPhone: "+91 94181 66666",
    history: "Dharamshala is situated in the scenic Kangra Valley. Since 1960, McLeod Ganj has served as the headquarters of the Central Tibetan Administration and home of the 14th Dalai Lama.",
    weddingVenues: [
      {
        id: "dhm-v1",
        name: "Hyatt Regency Dharamshala Resort",
        type: "Dhauladhar Mountain Resort",
        capacity: "250 - 700 Guests",
        pricePerEvent: "₹32 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop",
        vibe: "Dhauladhar Serenity",
        highlights: ["Pine Forest Sunset Lawn", "Tibetan Singing Bowl Welcome", "Heated Pool Deck"],
        description: "Nestled in dense pine forests beneath the majestic Dhauladhar ranges, ideal for serene mountain wedding celebrations."
      }
    ],
    uniqueWeddingProperties: [
      {
        id: "dhm-p1",
        title: "Kangra Valley Pine & Stream Estate",
        propertyType: "Stream-Side Mountain Villa",
        price: "₹6.8 Crores",
        specs: "6 Alpine Suites • 2.2 Acres • 450 Guest Lawns",
        location: "Sidhbari Valley, Dharamshala",
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
        features: ["Natural Mountain Stream", "Dhauladhar Views", "Yoga & Meditation Deck"],
        description: "Tranquil mountain estate along a natural stream, offering scenic lawn spaces for intimate destination weddings."
      }
    ]
  },

  // Rest of India
  {
    name: "Chandigarh",
    title: "The Planned City",
    desc: "Famed for its urban design by Le Corbusier, lush green sectors, and the Rock Garden.",
    image: "https://images.unsplash.com/photo-1609100877905-22d5140bf1dd?q=80&w=800&auto=format&fit=crop",
    tag: "Rest of India",
    vibe: "Urban Architecture",
    investmentIndex: "9.5/10",
    topLocalities: ["Sector 8", "Sector 9", "Mani Majra", "Sector 35"],
    averagePrice: "₹80 Lakhs - ₹15 Crores",
    agentName: "Rajesh Kumar Singh",
    agentPhone: "+91 99112 55555",
    history: "Chandigarh was one of the earliest planned cities in post-independence India. It serves as the joint capital of Punjab and Haryana, designed by renowned architect Le Corbusier.",
    weddingVenues: [
      {
        id: "chd-v1",
        name: "Sukhna Lakefront Club Lawns",
        type: "Lakefront Country Club",
        capacity: "500 - 1,800 Guests",
        pricePerEvent: "₹40 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop",
        vibe: "Modern Punjabi Glamour",
        highlights: ["Lakefront Sunset Backdrop", "Grand Sangeet Stage Infrastructure", "Bhangra & Dhol Welcome"],
        description: "Situated on the banks of Sukhna Lake, offering high-capacity lawn spaces and vibrant Punjabi celebration vibes."
      }
    ],
    uniqueWeddingProperties: [
      {
        id: "chd-p1",
        title: "Kasauli Foothill Farmhouse Estate",
        propertyType: "Luxury Farmhouse Estate",
        price: "₹14.2 Crores",
        specs: "9 Suites • 4.0 Acres • 1,200 Guest Lawns",
        location: "Chandigarh-Kalka Expressway, Chandigarh",
        image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=800&auto=format&fit=crop",
        features: ["4-Acre Manicured Lawns", "Private Guesthouse Wing", "Infinity Pool"],
        description: "Sprawling 4-acre farmhouse estate at the foothills of the Himalayas, designed for large destination weddings and pre-wedding functions."
      }
    ]
  },
  {
    name: "Agra",
    title: "City of the Taj",
    desc: "World-renowned for the magnificent Taj Mahal and deep Mughal historical roots.",
    image: "https://images.unsplash.com/photo-1564507592208-02754ba318dc?q=80&w=800&auto=format&fit=crop",
    tag: "Rest of India",
    vibe: "Mughal Heritage",
    investmentIndex: "8.7/10",
    topLocalities: ["Taj Ganj", "Sanjay Place", "Dayal Bagh", "Fatehabad Road"],
    averagePrice: "₹30 Lakhs - ₹5 Crores",
    agentName: "Anil Sharma Mittal",
    agentPhone: "+91 94140 12345",
    history: "Agra was the former capital of the Mughal Empire under Akbar, Jahangir, and Shah Jahan. It hosts the Taj Mahal, Agra Fort, and Fatehpur Sikri, all UNESCO World Heritage sites.",
    weddingVenues: [
      {
        id: "agr-v1",
        name: "ITC Mughal Taj View Lawns",
        type: "Mughal Garden Resort",
        capacity: "500 - 1,500 Guests",
        pricePerEvent: "₹45 Lakhs / Event",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop",
        vibe: "Mughal Imperial Elegance",
        highlights: ["Direct View of Taj Mahal Monument", "Charbagh Style Water Channels", "Royal Mughlai Cuisine"],
        description: "Award-winning resort set within 35 acres of Mughal gardens, offering romantic weddings with direct views of the Taj Mahal."
      }
    ],
    uniqueWeddingProperties: [
      {
        id: "agr-p1",
        title: "Fatehabad Taj View Mansion",
        propertyType: "Heritage Mansion",
        price: "₹7.8 Crores",
        specs: "7 Suites • 2.0 Acres • 700 Guest Lawns",
        location: "Fatehabad Tourist Corridor, Agra",
        image: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=800&auto=format&fit=crop",
        features: ["Rooftop Taj View Pavilion", "Mughal Arch Courtyards", "Private Banquet Hall"],
        description: "Mughal-inspired mansion property on Fatehabad corridor featuring rooftop views of the Taj Mahal and spacious celebration grounds."
      }
    ]
  }
];

export const TAGS = ["All", "Rajasthan", "Gujarat", "Himachal Pradesh", "Rest of India"];
