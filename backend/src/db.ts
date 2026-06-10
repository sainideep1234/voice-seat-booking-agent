import mongoose, { model, Schema } from "mongoose";

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
  createdAt: { type: Date, default: Date.now },
});

export const Booking = model("booking", bookingSchema);

export async function connectToDb() {
  try {
    const mongodbUrl = process.env.MONGODB_URL || process.env.MONGO_URI;
    if (!mongodbUrl) {
      throw new Error("MONGODB_URL or MONGO_URI environment variable is not defined");
    }
    await mongoose.connect(mongodbUrl);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error while connecting to DB:", error);
  }
}
