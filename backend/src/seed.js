import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Booking from "./models/Booking.js";
import Category from "./models/Category.js";
import Event from "./models/Event.js";
import Favorite from "./models/Favorite.js";
import Review from "./models/Review.js";
import User from "./models/User.js";
import Venue from "./models/Venue.js";

dotenv.config();
console.log("Duke u lidhur me MongoDB...");
await connectDB();

console.log("Duke pastruar koleksionet...");
await Booking.deleteMany();
await Category.deleteMany();
await Event.deleteMany();
await Favorite.deleteMany();
await Review.deleteMany();
await Venue.deleteMany();
await User.deleteMany();

console.log("Duke krijuar admin...");
const admin = await User.create({
  name: "Admin Eventify",
  email: "admin@eventify.test",
  password: "Admin123!",
  role: "admin"
});

console.log("Duke krijuar organizers...");
const organizers = await User.create([
  { name: "Ardit Events", email: "organizer1@eventify.test", password: "Organizer123!", role: "organizer" },
  { name: "Mira Live Studio", email: "organizer2@eventify.test", password: "Organizer123!", role: "organizer" }
]);

console.log("Duke krijuar users...");
const users = await User.create([
  { name: "Elira Hoxha", email: "user1@eventify.test", password: "User123!", role: "user" },
  { name: "Klea Dervishi", email: "user2@eventify.test", password: "User123!", role: "user" },
  { name: "Noel Gashi", email: "user3@eventify.test", password: "User123!", role: "user" },
  { name: "Sara Meta", email: "user4@eventify.test", password: "User123!", role: "user" },
  { name: "Dion Leka", email: "user5@eventify.test", password: "User123!", role: "user" }
]);

console.log("Duke krijuar categories...");
const categories = await Category.insertMany([
  { name: "Koncert", slug: "koncert", description: "Koncerte live, DJ sets dhe mbrëmje muzikore", icon: "music" },
  { name: "Konferencë", slug: "konference", description: "Konferenca biznesi, teknologjie dhe karriere", icon: "presentation" },
  { name: "Festival", slug: "festival", description: "Festivale kulinarie, kulturore dhe open-air", icon: "sparkles" },
  { name: "Teatër", slug: "teater", description: "Shfaqje teatri, komedi dhe performanca skenike", icon: "drama" },
  { name: "Sport", slug: "sport", description: "Ndeshje, gara dhe evente sportive", icon: "trophy" },
  { name: "Workshop", slug: "workshop", description: "Trajnime praktike, masterclass dhe bootcamp", icon: "school" }
]);

console.log("Duke krijuar venues...");
const venues = await Venue.insertMany([
  { name: "Pallati i Kongreseve", city: "Tiranë", address: "Bulevardi Dëshmorët e Kombit", capacity: 1800, type: "Concert Hall" },
  { name: "Air Albania Conference Hall", city: "Tiranë", address: "Arena Center", capacity: 850, type: "Conference" },
  { name: "Amfiteatri i Durrësit", city: "Durrës", address: "Qendra Historike", capacity: 1200, type: "Open Air" },
  { name: "Teatri Kombëtar Eksperimental", city: "Tiranë", address: "Rruga Sermedin Said Toptani", capacity: 450, type: "Theatre" },
  { name: "Lake Park Stage", city: "Tirane", address: "Parku i Liqenit", capacity: 1400, type: "Outdoor Stage" },
  { name: "Shkodra Cultural Hall", city: "Shkodër", address: "Pedonalja Kolë Idromeno", capacity: 650, type: "Cultural Hall" },
  { name: "Vlora Marina Arena", city: "Vlorë", address: "Lungomare", capacity: 1100, type: "Arena" },
  { name: "Korça Innovation Hub", city: "Korçë", address: "Pazari i Vjetër", capacity: 320, type: "Workshop Space" },
  { name: "Elbasan Expo Center", city: "Elbasan", address: "Rruga Qemal Stafa", capacity: 700, type: "Expo Center" },
  { name: "Gjirokastra Castle Stage", city: "Gjirokastër", address: "Kalaja e Gjirokastrës", capacity: 950, type: "Historic Open Air" }
]);

const images = [
  "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522158637959-30385a09e0da?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1551818255-e6e10975bc17?auto=format&fit=crop&w=1200&q=80"
];

const eventImages = {
  "Koncert": [
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1501612780327-45045538702b?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1400&q=80"
  ],
  "Konferencë": [
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1551818255-e6e10975bc17?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1400&q=80"
  ],
  "Festival": [
    "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1522158637959-30385a09e0da?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80"
  ],
  "Teatër": [
    "https://images.unsplash.com/photo-1507924538820-ede94a04019d?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=80"
  ],
  "Sport": [
    "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1547347298-4074fc3086f0?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1400&q=80"
  ],
  "Workshop": [
    "https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1400&q=80",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=80"
  ]
};

const titles = [
  ["Tirana Tech Summit 2026", "Konferencë", "Konferencë për startup, web development, produkte digjitale dhe inovacion."],
  ["Albanian Music Night", "Koncert", "Një mbrëmje live me artistë shqiptarë, skenë moderne dhe atmosferë festive."],
  ["Durrës Summer Food Fest", "Festival", "Festival kulinarie, muzikë dhe aktivitete në ambient të hapur."],
  ["Startup Founders Forum", "Konferencë", "Panel diskutimesh me sipërmarrës, investitorë dhe themelues produktesh."],
  ["Lake Park Jazz Evening", "Koncert", "Koncert jazz open-air me artistë lokalë dhe mysafirë ndërkombëtarë."],
  ["Vlora Beach Sports Day", "Sport", "Turne sportive në plazh, aktivitete komunitare dhe zona fansash."],
  ["UX Design Masterclass", "Workshop", "Workshop praktik për research, wireframes dhe prototipe interaktive."],
  ["Comedy Theatre Weekend", "Teatër", "Dy netë komedi me aktorë të njohur dhe skena të reja."],
  ["Korça Digital Skills Bootcamp", "Workshop", "Trajnim intensiv për aftësi digjitale, karrierë dhe portfolio."],
  ["Shkodra Culture Festival", "Festival", "Festival kulturor me muzikë, art, panair librash dhe performanca."],
  ["Future Finance Conference", "Konferencë", "Konferencë për fintech, pagesa digjitale dhe menaxhim biznesi."],
  ["Indie Rock Live", "Koncert", "Mbrëmje rock me banda të reja dhe set live energjik."],
  ["Tirana Marathon Expo", "Sport", "Ekspozitë sportive, regjistrime, pajisje dhe takime me sportistë."],
  ["Photography Night Walk", "Workshop", "Eksperiencë praktike fotografie urbane dhe editim bazik."],
  ["Open Air Cinema Fest", "Festival", "Shfaqje filmash në natyrë, ushqim dhe muzikë para projektimit."],
  ["Business Growth Day", "Konferencë", "Event për marketing, shitje, CRM dhe rritje të bizneseve."],
  ["Classical Evening", "Koncert", "Koncert me repertor klasik, piano dhe orkestër dhome."],
  ["Modern Theatre Premiere", "Teatër", "Premierë teatri modern me regji bashkëkohore dhe skenografi minimaliste."],
  ["AI for Business Workshop", "Workshop", "Workshop praktik për përdorimin e AI në punë dhe procese biznesi."],
  ["Fan Zone Derby Night", "Sport", "Transmetim live, zona fansash, lojëra dhe aktivitete para ndeshjes."],
  ["Balkan Electronic Weekend", "Koncert", "Dy netë muzikë elektronike me DJ, skenë vizuale dhe produksion modern."],
  ["Women in Business Forum", "Konferencë", "Forum për lidership, networking dhe histori suksesi nga gra sipërmarrëse."],
  ["Tirana Street Art Festival", "Festival", "Murale live, instalacione urbane, muzikë dhe panair krijuesish të rinj."],
  ["Kids Theatre Morning", "Teatër", "Shfaqje familjare me skena interaktive dhe histori edukative për fëmijë."],
  ["Basketball Finals Watch Party", "Sport", "Fan zone për finalet, ekran gjigant, aktivitete dhe çmime për pjesëmarrësit."],
  ["Social Media Creator Lab", "Workshop", "Trajnim praktik për content creation, video editing dhe strategji publikimi."],
  ["Cybersecurity Day Albania", "Konferencë", "Event për siguri kibernetike, privacy, cloud dhe mbrojtje të të dhënave."],
  ["Wine & Music Sunset", "Festival", "Degustim vere, muzikë akustike dhe panoramë në perëndim."],
  ["Opera Highlights Night", "Koncert", "Mbrëmje me arie të njohura, soprano, tenor dhe orkestër live."],
  ["Standup Comedy Special", "Teatër", "Natë standup comedy me materiale të reja dhe publik të përfshirë."],
  ["Trail Running Challenge", "Sport", "Garë në natyrë me itinerare të ndryshme dhe zonë rikuperimi për sportistët."],
  ["Product Management Bootcamp", "Workshop", "Bootcamp për roadmap, prioritizim, analytics dhe launch produkti."],
  ["Albania Tourism Forum", "Konferencë", "Forum për turizmin, hotelet, eksperiencat lokale dhe marketingun e destinacioneve."],
  ["Elbasan Craft Beer Weekend", "Festival", "Fundjavë me birra artizanale, food trucks, muzikë live dhe aktivitete sociale."],
  ["Gjirokastra Folk Night", "Koncert", "Mbrëmje folklorike në skenë historike me valle, iso-polifoni dhe instrumentistë live."],
  ["Creative Coding Jam", "Workshop", "Sesione praktike për front-end, animacione web dhe eksperimente interaktive."]
];

function ticketTypes(basePrice, totalTickets) {
  const vipCapacity = Math.max(Math.floor(totalTickets * 0.15), 10);
  const studentCapacity = Math.max(Math.floor(totalTickets * 0.2), 20);
  const regularCapacity = totalTickets - vipCapacity - studentCapacity;
  return [
    { name: "Regular", price: basePrice, capacity: regularCapacity, soldTickets: 0 },
    { name: "VIP", price: Math.round(basePrice * 1.8), capacity: vipCapacity, soldTickets: 0 },
    { name: "Student", price: Math.round(basePrice * 0.7), capacity: studentCapacity, soldTickets: 0 }
  ];
}

const categoryDetails = {
  Koncert: {
    tags: ["live music", "nightlife", "stage"],
    rules: ["Hyrja hapet 60 minuta para nisjes.", "Ndalohet ushqimi dhe pija nga jashtë.", "Bileta duhet paraqitur në hyrje."],
    agenda: ["Doors open", "Opening act", "Main performance", "After show"],
    seatingType: "standing"
  },
  Konferencë: {
    tags: ["business", "networking", "talks"],
    rules: ["Regjistrimi hapet 45 minuta para nisjes.", "Badge duhet mbajtur gjatë gjithë eventit.", "Vendet janë të limituara sipas kapacitetit."],
    agenda: ["Registration", "Keynote session", "Panel discussion", "Networking"],
    seatingType: "seated"
  },
  Festival: {
    tags: ["open air", "food", "culture"],
    rules: ["Eventi zhvillohet edhe në mot me shi të lehtë.", "Fëmijët duhet të shoqërohen nga të rritur.", "Respekto zonat e dedikuara për publikun."],
    agenda: ["Gates open", "Local showcase", "Headline experience", "Closing set"],
    seatingType: "standing"
  },
  Teatër: {
    tags: ["theatre", "performance", "culture"],
    rules: ["Hyrja pas fillimit të shfaqjes mund të kufizohet.", "Telefonat duhet të jenë në silent mode.", "Fotografimi me flash nuk lejohet."],
    agenda: ["Audience entry", "Act I", "Intermission", "Act II"],
    seatingType: "seated"
  },
  Sport: {
    tags: ["sports", "fans", "community"],
    rules: ["Hyrja kontrollohet me biletë digjitale.", "Objektet e rrezikshme nuk lejohen.", "Respekto udhëzimet e stafit të sigurisë."],
    agenda: ["Fan zone opens", "Warm-up", "Main event", "Awards"],
    seatingType: "seated"
  },
  Workshop: {
    tags: ["learning", "hands-on", "career"],
    rules: ["Sill laptopin personal nëse kërkohet.", "Materialet ndahen vetëm me pjesëmarrësit.", "Rezervimi është i vlefshëm për një person."],
    agenda: ["Check-in", "Practical session", "Mentor feedback", "Wrap-up"],
    seatingType: "seated"
  }
};

function buildAgenda(category, eventDate) {
  return categoryDetails[category].agenda.map((title, index) => {
    const agendaDate = new Date(eventDate);
    agendaDate.setMinutes(agendaDate.getMinutes() + index * 55);
    return {
      time: agendaDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
      title,
      description: index === 0 ? "Mirëpritje dhe orientim për pjesëmarrësit." : "Segment kryesor i programit të eventit."
    };
  });
}

function galleryFor(category, index) {
  const pool = eventImages[category] || images;
  return [0, 1, 2].map((offset) => pool[(index + offset) % pool.length]);
}

console.log("Duke krijuar events...");
const eventDocs = await Event.insertMany(titles.map(([title, category, description], index) => {
  const totalTickets = 220 + (index % 7) * 90;
  const price = 900 + (index % 6) * 550;
  const eventDate = new Date(Date.now() + (index + 4) * 3 * 24 * 60 * 60 * 1000);
  eventDate.setHours(17 + (index % 5), index % 2 === 0 ? 0 : 30, 0, 0);
  const venue = venues[index % venues.length];
  const categoryMeta = categoryDetails[category];
  const initialTicketTypes = ticketTypes(price, totalTickets);
  const galleryImages = galleryFor(category, index);
  const primaryImage = galleryImages[0];
  return {
    title,
    category,
    description,
    longDescription: `${description} Eventi është konceptuar si një eksperiencë e plotë për publikun, me program të kuruar, organizim profesional, staf në hyrje dhe informacion të qartë për biletat. Pjesëmarrësit mund të zgjedhin tipin e biletës, të shohin kapacitetin e mbetur dhe të paraqiten në event me kod unik bilete.`,
    image: primaryImage,
    bannerImage: primaryImage,
    galleryImages,
    date: eventDate,
    time: eventDate.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
    venue: venue._id,
    city: venue.city,
    address: venue.address,
    organizer: organizers[index % organizers.length]._id,
    price,
    priceFrom: price,
    capacity: totalTickets,
    remainingSeats: totalTickets,
    totalTickets,
    soldTickets: 0,
    ticketTypes: initialTicketTypes,
    bookingLimit: 4 + (index % 4),
    rating: 0,
    tags: [...categoryMeta.tags, venue.city.toLowerCase(), index < 8 ? "featured" : "upcoming"],
    agenda: buildAgenda(category, eventDate),
    rules: categoryMeta.rules,
    seatingType: categoryMeta.seatingType,
    status: "published",
    featured: index < 4
  };
}));

const eventState = new Map(eventDocs.map((event) => [
  String(event._id),
  {
    soldTickets: 0,
    ticketTypes: event.ticketTypes.map((type) => ({ ...type.toObject(), soldTickets: 0 }))
  }
]));

const bookingStatuses = ["paid", "reserved", "paid", "checked-in"];
const bookings = [];
const seatedSeatCursor = new Map();
const demoAttendeeNames = [
  "Elira Hoxha",
  "Klea Dervishi",
  "Noel Gashi",
  "Sara Meta",
  "Dion Leka",
  "Arber Kola",
  "Luna Prifti",
  "Mateo Deda",
  "Era Shehu",
  "Kevin Cela"
];

function nextDemoSeats(event, quantity) {
  const rows = ["A", "B", "C"];
  const current = seatedSeatCursor.get(String(event._id)) || 0;
  const seats = Array.from({ length: quantity }, (_, offset) => {
    const index = current + offset;
    return `${rows[Math.floor(index / 5) % rows.length]}${(index % 5) + 1}`;
  });
  seatedSeatCursor.set(String(event._id), current + quantity);
  return seats;
}

for (let index = 0; index < 55; index += 1) {
  const event = eventDocs[index % eventDocs.length];
  const state = eventState.get(String(event._id));
  const type = state.ticketTypes[index % state.ticketTypes.length];
  const quantity = (index % 3) + 1;

  if (type.soldTickets + quantity > type.capacity) continue;

  type.soldTickets += quantity;
  state.soldTickets += quantity;
  const selectedSeats = event.seatingType === "seated" ? nextDemoSeats(event, quantity) : [];
  const subtotal = quantity * type.price;
  const serviceFee = Math.round(subtotal * 0.06);
  const totalPrice = subtotal + serviceFee;
  const attendees = Array.from({ length: quantity }, (_, offset) => ({
    fullName: demoAttendeeNames[(index + offset) % demoAttendeeNames.length],
    seat: selectedSeats[offset] || ""
  }));
  bookings.push({
    user: users[index % users.length]._id,
    event: event._id,
    ticketType: type.name,
    selectedSeats,
    attendees,
    quantity,
    unitPrice: type.price,
    serviceFee,
    totalPrice,
    total: totalPrice,
    status: bookingStatuses[index % bookingStatuses.length],
    ticketCode: `EVT-DEMO-${String(index + 1).padStart(3, "0")}`
  });
}

console.log("Duke krijuar bookings...");
await Booking.insertMany(bookings);

console.log("Duke perditesuar counters te eventeve...");
await Promise.all(eventDocs.map((event) => {
  const state = eventState.get(String(event._id));
  return Event.findByIdAndUpdate(event._id, {
    soldTickets: state.soldTickets,
    remainingSeats: Math.max(event.totalTickets - state.soldTickets, 0),
    ticketTypes: state.ticketTypes,
    status: state.soldTickets >= event.totalTickets ? "soldout" : "published"
  });
}));

const reviewComments = [
  "Event shumë i organizuar dhe bileta u rezervua pa asnjë problem.",
  "Atmosferë e bukur, lokacion i përshtatshëm dhe hyrje e shpejtë.",
  "Do ta rekomandoja, sidomos për mënyrën si menaxhohen biletat.",
  "Eksperiencë e mirë, por do doja më shumë sinjalistikë në hyrje.",
  "Program i pasur dhe staf shumë korrekt."
];

const reviewDocs = [];
for (const event of eventDocs) {
  for (const user of users) {
    if (reviewDocs.length >= 35) break;
    const index = reviewDocs.length;
    reviewDocs.push({
      user: user._id,
      event: event._id,
      rating: 3 + (index % 3),
      comment: reviewComments[index % reviewComments.length]
    });
  }
  if (reviewDocs.length >= 35) break;
}

console.log("Duke krijuar reviews...");
await Review.insertMany(reviewDocs);

console.log("Duke perditesuar ratings...");
await Promise.all(eventDocs.map((event) => {
  const eventReviews = reviewDocs.filter((review) => String(review.event) === String(event._id));
  const averageRating = eventReviews.length
    ? Number((eventReviews.reduce((sum, review) => sum + review.rating, 0) / eventReviews.length).toFixed(1))
    : 0;
  return Event.findByIdAndUpdate(event._id, {
    rating: averageRating,
    averageRating,
    reviewCount: eventReviews.length
  });
}));

console.log("Duke krijuar favorites...");
await Favorite.insertMany(users.flatMap((user, userIndex) => [
  { user: user._id, event: eventDocs[userIndex]._id },
  { user: user._id, event: eventDocs[userIndex + 5]._id }
]));

console.log("Seed u krye me sukses.");
console.log(`Admin: ${admin.email} / Admin123!`);
console.log("Organizer 1: organizer1@eventify.test / Organizer123!");
console.log("Organizer 2: organizer2@eventify.test / Organizer123!");
console.log("Users: user1@eventify.test ... user5@eventify.test / User123!");
console.log(`U krijuan: ${categories.length} kategori, ${venues.length} venues, ${eventDocs.length} evente, ${bookings.length} booking-e, ${reviewDocs.length} reviews.`);
process.exit(0);
