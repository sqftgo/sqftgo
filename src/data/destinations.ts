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
}

export const DESTINATIONS: Destination[] = [
  // Rajasthan
  {
    name: "Udaipur",
    title: "The City of Lakes",
    desc: "Known for floating marble palaces, historic Mewar arches, and serene lakeside sunsets.",
    image: "https://images.unsplash.com/photo-1615836245337-f58249622d10?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan",
    vibe: "Royal Lakefront",
    investmentIndex: "9.4/10",
    topLocalities: ["Lake Palace Road", "Panchwati", "Shobhagpura", "Fatehsagar Lake"],
    averagePrice: "₹45 Lakhs - ₹8.5 Crores",
    agentName: "Chandra Shekhar Mewar",
    agentPhone: "+91 94140 88221",
    history: "Udaipur was founded in 1553 by Maharana Udai Singh II as the new capital of the Mewar Kingdom. The city is famous for its stunning lakes, heritage palaces, and traditional Mewari arches."
  },
  {
    name: "Jaipur",
    title: "The Pink City",
    desc: "Home of the majestic Hawa Mahal, block printers, royal fort gates, and bustling bazaars.",
    image: "https://images.unsplash.com/photo-1599661509650-13f9f753229b?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan",
    vibe: "Fort Heritage",
    investmentIndex: "9.6/10",
    topLocalities: ["C-Scheme", "Malviya Nagar", "Vaishali Nagar", "Mansarovar"],
    averagePrice: "₹35 Lakhs - ₹12 Crores",
    agentName: "Aditya Vardhan Sharma",
    agentPhone: "+91 98290 12345",
    history: "Jaipur was founded in 1727 by Maharaja Sawai Jai Singh II. It is India's first planned city, renowned for its color-coded pink architecture and astronomical observatories like Jantar Mantar."
  },
  {
    name: "Jaisalmer",
    title: "The Golden City",
    desc: "Discover ancient sandstone forts emerging from the Thar desert and yellow dune camps.",
    image: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan",
    vibe: "Desert Sandstone",
    investmentIndex: "8.8/10",
    topLocalities: ["Kuldhara", "Sam Sand Dunes", "Fort Road", "Dedansar"],
    averagePrice: "₹25 Lakhs - ₹4 Crores",
    agentName: "Sumer Singh Bhati",
    agentPhone: "+91 98292 22222",
    history: "Jaisalmer, meaning the Hill Fort of Jaisal, was founded in 1156 AD by the Rajput ruler Rawal Jaisal. The fort stands as a living heritage monument housing a quarter of the city's population."
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
    history: "Jodhpur was founded in 1459 by Rao Jodha, a chief of the Rathore clan. The city is celebrated for its majestic blue-walled houses and the towering Mehrangarh Fort that dominates the skyline."
  },
  {
    name: "Pali",
    title: "Heritage & Craft Hub",
    desc: "Famous for its textile industries, traditional craftsmanship, and historic temples.",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan",
    vibe: "Heritage & Craft",
    investmentIndex: "8.5/10",
    topLocalities: ["Industrial Area Housing", "Suraj Pole", "Marwar Junction Area"],
    averagePrice: "₹15 Lakhs - ₹3.5 Crores",
    agentName: "Vijay Sood Kothari",
    agentPhone: "+91 94140 12345",
    history: "Pali, located on the banks of the Bandi River, has been a historic trading post since ancient times, renowned for its textile mills and proximity to famous heritage temples like Ranakpur."
  },
  {
    name: "Alwar",
    title: "Expressway Gateway",
    desc: "Historic gateway of Rajasthan near Delhi NCR with palaces and proximity to Sariska National Park.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan",
    vibe: "Expressway Proximity",
    investmentIndex: "8.9/10",
    topLocalities: ["Manu Marg", "NEB Housing Board", "Shivaji Park"],
    averagePrice: "₹20 Lakhs - ₹4.5 Crores",
    agentName: "Rajesh Kumar Singh",
    agentPhone: "+91 94140 12345",
    history: "Alwar was founded in 1770 by Pratap Singh. It is home to magnificent heritage structures like the City Palace, Moosi Maharani ki Chhatri, and the tiger sanctuary of Sariska."
  },
  {
    name: "Pushkar",
    title: "The Holy City",
    desc: "Sacred lakes, spiritual ghats, and the world-famous camel fair surrounded by hills.",
    image: "https://images.unsplash.com/photo-1587591605556-9d2c20dd93b3?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan",
    vibe: "Spiritual Heritage",
    investmentIndex: "8.9/10",
    topLocalities: ["Pushkar Lake", "Varaha Ghat", "Choti Basti", "Budha Pushkar"],
    averagePrice: "₹20 Lakhs - ₹3.5 Crores",
    agentName: "Pandit Ram Sharma",
    agentPhone: "+91 94143 33333",
    history: "Pushkar is one of the oldest existing cities in India, mythical for having the only temple dedicated to Lord Brahma in the world. It centers around a holy lake with 52 bathing ghats."
  },
  {
    name: "Kota",
    title: "River & Education Hub",
    desc: "Situated on the banks of the Chambal River, known for its educational prominence and gardens.",
    image: "https://images.unsplash.com/photo-1623910278913-99ab9403d526?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan",
    vibe: "Riverside Commerce",
    investmentIndex: "8.9/10",
    topLocalities: ["Talwandi", "Kunhari", "Rajeev Gandhi Nagar", "Vigyan Nagar"],
    averagePrice: "₹25 Lakhs - ₹4.5 Crores",
    agentName: "Devendra Jindal Verma",
    agentPhone: "+91 98888 77777",
    history: "Kota lies along the eastern bank of the Chambal River. Historically it was part of the Rajput kingdom of Bundi, and later became an independent state renowned for its grand gardens and palaces."
  },
  {
    name: "Bikaner",
    title: "Desert Heritage",
    desc: "Renowned for its impressive Junagarh Fort, Karni Mata Temple, and vibrant desert culture.",
    image: "https://images.unsplash.com/photo-1601058223659-43ccefc2f6e9?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan",
    vibe: "Traditional Desert",
    investmentIndex: "8.6/10",
    topLocalities: ["Jayanarayan Vyas Colony", "Sadul Ganj", "Rani Bazar", "Ganga Shahar"],
    averagePrice: "₹18 Lakhs - ₹3 Crores",
    agentName: "Vikram Chauhan Singh",
    agentPhone: "+91 98281 12233",
    history: "Bikaner was founded in 1488 by Rao Bika, a Rathore prince. The city is famous for its intricate red sandstone havelis, rich history, camel research farms, and Junagarh Fort."
  },
  {
    name: "Rajsamand",
    title: "Lakes & Marble",
    desc: "Famous for the massive Rajsamand Lake and its thriving marble production industry.",
    image: "https://images.unsplash.com/photo-1634547432360-0ed6568285cb?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan",
    vibe: "Industrial Mining",
    investmentIndex: "8.5/10",
    topLocalities: ["Kankroli", "Jalchakri", "Dwarkadheesh Colony", "Nathdwara Road"],
    averagePrice: "₹15 Lakhs - ₹2.8 Crores",
    agentName: "Abhinav Vyas Raj",
    agentPhone: "+91 98290 22222",
    history: "Rajsamand is named after the magnificent Rajsamand Lake, constructed by Maharana Raj Singh of Mewar in the 17th century. It is a major hub of Indian marble extraction and craftsmanship."
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
    history: "Ahmedabad was founded in 1411 by Sultan Ahmed Shah. It developed into a leading textile center known as the 'Manchester of the East' and houses Mahatma Gandhi's historic Sabarmati Ashram."
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
    history: "Surat was a major port of the Mughal empire and the British East India Company. It has evolved into one of the cleanest, fastest-growing economic capitals of Gujarat."
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
    history: "Rajkot was the former capital of the princely state of Saurashtra. It holds historical importance as the place where Mahatma Gandhi spent his childhood years at the Alfred High School."
  },
  {
    name: "Gandhinagar",
    title: "Planned Green Capital",
    desc: "The tree-lined planned capital of Gujarat, housing the high-tech GIFT City financial zone.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=800&auto=format&fit=crop",
    tag: "Gujarat",
    vibe: "Planned Greenery",
    investmentIndex: "9.2/10",
    topLocalities: ["Sector 21", "Gift City", "Sector 30"],
    averagePrice: "₹40 Lakhs - ₹9 Crores",
    agentName: "Ketan Bhai Patel",
    agentPhone: "+91 98251 44444",
    history: "Gandhinagar, named after Mahatma Gandhi, was established in 1970 as the capital of Gujarat. Designed by H.K. Mewada, it is one of India's greenest and most systematically laid-out cities."
  },
  {
    name: "Kutch",
    title: "Salt Desert Oasis",
    desc: "Vast white salt desert plains, historical Bhuj palaces, and scenic coastal port towns.",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800&auto=format&fit=crop",
    tag: "Gujarat",
    vibe: "Salt Desert Oasis",
    investmentIndex: "8.6/10",
    topLocalities: ["Bhuj", "Mandvi Port Area", "Anjar"],
    averagePrice: "₹15 Lakhs - ₹3.5 Crores",
    agentName: "Parth Patel Shah",
    agentPhone: "+91 99112 99112",
    history: "Kutch is the largest district in India, historically a self-governed state famous for the Great Rann of Kutch (a seasonal salt desert), exquisite handicrafts, and Kutchi heritage."
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
    history: "Anand is globally renowned for hosting the head office of AMUL dairy and triggering the White Revolution (Operation Flood). It is also a thriving educational and agricultural hub."
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
    history: "Shimla was declared the summer capital of British India in 1864. It is famous for the Kalka-Shimla toy train railway (UNESCO Heritage) and classic Tudor-style architecture."
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
    history: "Dharamshala is situated in the scenic Kangra Valley. Since 1960, McLeod Ganj has served as the headquarters of the Central Tibetan Administration and home of the 14th Dalai Lama."
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
    history: "Chandigarh was one of the earliest planned cities in post-independence India. It serves as the joint capital of Punjab and Haryana, designed by renowned architect Le Corbusier."
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
    history: "Agra was the former capital of the Mughal Empire under Akbar, Jahangir, and Shah Jahan. It hosts the Taj Mahal, Agra Fort, and Fatehpur Sikri, all UNESCO World Heritage sites."
  }
];

export const TAGS = ["All", "Rajasthan", "Gujarat", "Himachal Pradesh", "Rest of India"];
