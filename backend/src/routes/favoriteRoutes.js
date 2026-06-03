import express from "express";
import { addFavorite, deleteFavorite, getFavorites } from "../controllers/favoriteController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("user", "customer"));

router.route("/")
  .get(getFavorites)
  .post(addFavorite);

router.delete("/:eventId", deleteFavorite);

export default router;
