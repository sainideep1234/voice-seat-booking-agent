import { model, Schema } from "mongoose";
 const bookingSchema = new Schema({
  customerName: { type: String, required: true },
  numberOfGuests: { type: Number },
  bookingDate: { type: Date },
  bookingTime: { type: String },
  cuisinePreference: String,
  specialRequests: String,
  weatherInfo: Object, // {temprature : "20c" , weather : "cloudy"  }
  seatingPreference: String, // indoor/outdoor
  status: String, // confirmed, pending, cancelled
  createdAt: Date,
});

export const Booking = model("booking", bookingSchema);
