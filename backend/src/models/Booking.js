import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    ticketType: { type: String, enum: ["Regular", "VIP", "Student"], default: "Regular" },
    selectedSeats: { type: [String], default: [] },
    attendees: {
      type: [
        {
          fullName: { type: String, required: true, trim: true },
          seat: { type: String, default: "" }
        }
      ],
      default: []
    },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    serviceFee: { type: Number, default: 0, min: 0 },
    totalPrice: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["reserved", "paid", "checked-in", "cancelled"],
      default: "reserved"
    },
    ticketCode: { type: String, required: true, unique: true }
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
