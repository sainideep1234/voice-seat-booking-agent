import z from "zod";

export const bookInput = z.object({
  customerName: z.string(),
  numberOfGuests: z.number(),
  bookingDate: z.string(),
  bookingTime: z.string(),
  cuisinePreference: z.string(),
  specialRequests: z.string(),
  weatherInfo: z.object({ weather: z.string(), temprature: z.string() }),
  seatingPreference: z.enum(["indoor", "outdoor"]),
  status: z.enum(["confirmed", "pending", "cancelled"]),
});
