import express from "express";
import { createVenue, deleteVenue, getVenues, updateVenue } from "../controllers/venueController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getVenues)
  .post(protect, authorize("admin", "organizer"), createVenue);

router.route("/:id")
  .put(protect, authorize("admin", "organizer"), updateVenue)
  .delete(protect, authorize("admin"), deleteVenue);

export default router;
