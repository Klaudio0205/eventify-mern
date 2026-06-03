import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import { connectDB } from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import venueRoutes from "./routes/venueRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5060;

const allowedOrigins = [
  ...(process.env.CLIENT_URL || "http://localhost:5175").split(",").map((origin) => origin.trim()).filter(Boolean),
  "http://127.0.0.1:5175"
];

app.use(cors({
  origin(origin, callback) {
    const localNetworkOrigin = /^http:\/\/(192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}):5175$/.test(origin);
    if (!origin || allowedOrigins.includes(origin) || localNetworkOrigin) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin nuk lejohet nga CORS."));
  }
}));
app.use(express.json());
app.use(morgan("dev"));

app.get("/", (req, res) => res.json({ message: "Eventify API" }));
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/venues", venueRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);

app.use(notFound);
app.use(errorHandler);

connectDB()
  .then(() => app.listen(port, () => console.log(`API po punon ne porten ${port}`)))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
