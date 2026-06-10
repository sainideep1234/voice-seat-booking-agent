import express, { type Request, type Response } from "express";
import { Booking } from "./models";
import { bookInput } from "./type";
import { connectToDb } from "./mongodb_client";
import mongoose from "mongoose";
import cors from "cors";
const app = express();
const PORT = 3001;
app.use(cors());
app.use(express.json());
app.get("/api/booking", async (req: Request, res: Response) => {
  const booking = await Booking.find();
  if (!booking) {
    res.status(400).json({
      message: "no booking",
    });
    return;
  }
  res.status(201).json({
    message: "booking fetched succesfully",
    booking,
  });
});
app.get("/api/booking/:id", async (req: Request, res: Response) => {
  const { id: bookingId } = req.params;
  const booking = await Booking.find({ _id: bookingId });
  if (!booking) {
    res.status(400).json({
      message: "no booking",
    });
    return;
  }
  res.status(201).json({
    message: "booking fetched succesfully",
    booking,
  });
});
app.post(
  "/api/booking/check-availability",
  async (req: Request, res: Response) => {
    try {
      const { bookingDate, bookingTime } = req.body;
      if (!bookingDate || !bookingTime) {
        res
          .status(400)
          .json({ message: "bookingDate and bookingTime are required" });
        return;
      }
      const count = await Booking.countDocuments({
        bookingDate: new Date(bookingDate),
        bookingTime,
        status: { $ne: "cancelled" },
      });
      const maxCapacity = 5;
      res.status(200).json({
        isAvailable: count < maxCapacity,
        remainingTables: maxCapacity - count,
      });
    } catch (error) {
      console.error("Error checking availability", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);
app.post("/api/booking", async (req: Request, res: Response) => {
  try {
    console.log("call entered to booking request");
    const {
      customerName,
      numberOfGuests,
      bookingDate,
      bookingTime,
      cuisinePreference,
      specialRequests,
      weatherInfo,
      seatingPreference,
      status,
    } = req.body;
    const booking = await Booking.create({
      customerName,
      numberOfGuests,
      bookingDate,
      bookingTime,
      cuisinePreference,
      specialRequests,
      weatherInfo,
      seatingPreference,
      status,
    });
    if (!booking) {
      res.status(500).json({
        message: "Failed to book order",
      });
    }
    res.status(201).json({
      message: `Booking is done. here is your booking id :${booking._id} , status : ${booking.status} `,
    });
  } catch (error) {
    console.log("server error while creating booking", error);
  }
});
app.delete("/api/booking/:id", async (req: Request, res: Response) => {
  const { id: bookingId } = req.params;
  const deleteBooking = await Booking.findByIdAndDelete({ _id: bookingId });
  if (!deleteBooking) {
    res.status(400).json({
      message: "no booking",
    });
    return;
  }
  res.status(201).json({
    message: `Deleted booking : ${bookingId} successfully`,
  });
});
connectToDb();
app.listen(PORT, () => {
  console.log(`server is started on port ${PORT}`);
});
