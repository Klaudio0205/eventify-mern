import express from "express";
import { createUser, deleteUser, getUserById, getUsers, updateUser } from "../controllers/userController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.route("/")
  .get(getUsers)
  .post(createUser);

router.route("/:id")
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

export default router;
