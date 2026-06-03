import express from "express";
import { createEvent, deleteEvent, getEventAttendees, getEventById, getEvents, updateEvent } from "../controllers/eventController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getEvents)
  .post(protect, authorize("admin", "organizer"), createEvent);

router.get("/:id/attendees", protect, authorize("admin", "organizer"), getEventAttendees);

router.route("/:id")
  .get(getEventById)
  .put(protect, authorize("admin", "organizer"), updateEvent)
  .delete(protect, authorize("admin", "organizer"), deleteEvent);

export default router;
