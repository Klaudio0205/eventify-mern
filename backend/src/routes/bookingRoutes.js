import express from "express";
import { createBooking, deleteBooking, getBookings, getDashboard, updateBooking } from "../controllers/bookingController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, authorize("admin", "organizer", "staff"), getDashboard);

router.route("/")
  .get(protect, getBookings)
  .post(protect, authorize("user", "customer"), createBooking);

router.route("/:id")
  .put(protect, authorize("admin", "organizer", "user", "customer"), updateBooking)
  .delete(protect, authorize("admin", "organizer"), deleteBooking);

export default router;
