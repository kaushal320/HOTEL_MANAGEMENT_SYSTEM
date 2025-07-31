import mongoose, { Document, Schema } from "mongoose";

export interface IHotel extends Document {
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  amenities: string[];
  images: string[];
  roomsAvailable: number;
  createdBy: mongoose.Types.ObjectId;
}

const hotelSchema = new Schema<IHotel>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
    amenities: [{ type: String }],
    images: [{ type: String }],
    roomsAvailable: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);
hotelSchema.index(
  { name: 1, address: 1, city: 1, country: 1 },
  { unique: true }
);

const Hotel = mongoose.model<IHotel>("Hotel", hotelSchema);

export default Hotel;
