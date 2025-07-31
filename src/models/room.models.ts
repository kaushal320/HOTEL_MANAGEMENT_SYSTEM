import mongoose, { Document, Schema } from "mongoose";

export interface IRoom extends Document {
  hotel: mongoose.Types.ObjectId;
  type: "Single" | "Double" | "Deluxe" | "Queen" | "Suite";
  price: number;
  amenities: string[];
  maxOccupancy: number;
  availableRooms: number;
  images: string[];
}

const roomSchema = new Schema<IRoom>(
  {
    hotel: { type: Schema.Types.ObjectId, ref: "Hotel", required: true },
    type: {
      type: String,
      enum: ["Single", "Double", "Deluxe", "Queen", "Suite"],
      required: true,
    },
    price: { type: Number, required: true },
    amenities: [{ type: String }],
    maxOccupancy: { type: Number, required: true },
    availableRooms: { type: Number, required: true },
    images: [{ type: String }],
  },
  { timestamps: true }
);

const Room = mongoose.model<IRoom>("Room", roomSchema);

export default Room;
