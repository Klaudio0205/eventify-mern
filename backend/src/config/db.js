import mongoose from "mongoose";

export async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI mungon.");
  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
  console.log("MongoDB u lidh me sukses");
}
