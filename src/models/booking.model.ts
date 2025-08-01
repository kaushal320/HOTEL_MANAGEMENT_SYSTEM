import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  hotel: mongoose.Types.ObjectId;
  room: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  status: "pending" | "confirmed" | "cancelled" | "checked-in" | "completed";
  totalPrice: number;
  createdAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "checked-in", "completed"],
      default: "pending",
    },
    totalPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IBooking>("Booking", bookingSchema);
