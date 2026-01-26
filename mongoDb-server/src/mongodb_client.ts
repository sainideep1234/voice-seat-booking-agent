import mongoose from "mongoose";

export async function connectToDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URL!);
    console.log("connected to Db successfully");
  } catch (error) {
    console.log("Error while connecting to DB", error);
  }
}
