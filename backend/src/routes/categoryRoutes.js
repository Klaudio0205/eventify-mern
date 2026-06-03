import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory
} from "../controllers/categoryController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getCategories)
  .post(protect, authorize("admin"), createCategory);

router.route("/:id")
  .get(getCategoryById)
  .put(protect, authorize("admin"), updateCategory)
  .delete(protect, authorize("admin"), deleteCategory);

export default router;
