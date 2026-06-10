import { model, Schema } from "mongoose";
const bookingSchema = new Schema({
  customerName: { type: String, required: true },
  numberOfGuests: { type: Number },
  bookingDate: { type: Date },
  bookingTime: { type: String },
  cuisinePreference: String,
  specialRequests: String,
  weatherInfo: Object,
  seatingPreference: String,
  status: String,
  createdAt: Date,
});
export const Booking = model("booking", bookingSchema);
