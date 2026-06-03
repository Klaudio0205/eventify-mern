import express from "express";
import { createReview, deleteReview, getReviews, updateReview } from "../controllers/reviewController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getReviews)
  .post(protect, authorize("user", "customer"), createReview);

router.route("/:id")
  .put(protect, updateReview)
  .delete(protect, deleteReview);

export default router;
