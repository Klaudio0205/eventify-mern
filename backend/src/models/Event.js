import mongoose from "mongoose";

const ticketTypeSchema = new mongoose.Schema(
  {
    name: { type: String, enum: ["Regular", "VIP", "Student"], required: true },
    price: { type: Number, required: true, min: 0 },
    capacity: { type: Number, required: true, min: 1 },
    soldTickets: { type: Number, default: 0, min: 0 }
  },
  { _id: false }
);

const agendaItemSchema = new mongoose.Schema(
  {
    time: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" }
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    longDescription: { type: String, default: "" },
    image: { type: String, required: true },
    bannerImage: { type: String, default: "" },
    galleryImages: { type: [String], default: [] },
    date: { type: Date, required: true },
    time: { type: String, default: "" },
    venue: { type: mongoose.Schema.Types.ObjectId, ref: "Venue", required: true },
    city: { type: String, default: "" },
    address: { type: String, default: "" },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    price: { type: Number, required: true, min: 0 },
    priceFrom: { type: Number, default: 0, min: 0 },
    capacity: { type: Number, default: 0, min: 0 },
    remainingSeats: { type: Number, default: 0, min: 0 },
    totalTickets: { type: Number, required: true, min: 1 },
    soldTickets: { type: Number, default: 0, min: 0 },
    ticketTypes: {
      type: [ticketTypeSchema],
      default: []
    },
    bookingLimit: { type: Number, default: 6, min: 1, max: 20 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    tags: { type: [String], default: [] },
    agenda: { type: [agendaItemSchema], default: [] },
    rules: { type: [String], default: [] },
    seatingType: { type: String, enum: ["seated", "standing"], default: "standing" },
    status: { type: String, enum: ["draft", "published", "soldout", "cancelled"], default: "published" },
    featured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

eventSchema.pre("validate", function setDefaultTicketTypes(next) {
  if (!this.ticketTypes?.length && this.price && this.totalTickets) {
    const vipCapacity = Math.max(Math.floor(this.totalTickets * 0.15), 1);
    const studentCapacity = Math.max(Math.floor(this.totalTickets * 0.2), 1);
    const regularCapacity = Math.max(this.totalTickets - vipCapacity - studentCapacity, 1);
    this.ticketTypes = [
      { name: "Regular", price: this.price, capacity: regularCapacity, soldTickets: Math.min(this.soldTickets || 0, regularCapacity) },
      { name: "VIP", price: Math.round(this.price * 1.8), capacity: vipCapacity, soldTickets: 0 },
      { name: "Student", price: Math.round(this.price * 0.7), capacity: studentCapacity, soldTickets: 0 }
    ];
  }
  next();
});

export default mongoose.model("Event", eventSchema);
