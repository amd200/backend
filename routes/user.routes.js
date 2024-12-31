import express from "express";
import { getAllUsers, getUserById, updateUser, deleteUser, getUserOrders } from "../controllers/user.controller.js";
import { authenticatedUser, authorizePermissions } from "../middleware/authentication.js";
const router = express.Router();

router.route("/").get([authenticatedUser, authorizePermissions("ADMIN")], getAllUsers);

router.route("/:id/orders").get([authenticatedUser, authorizePermissions("ADMIN"), getUserOrders]);
router
  .route("/:id")
  .get([authenticatedUser], getUserById)
  .patch([authenticatedUser, authorizePermissions("ADMIN")], updateUser)
  .delete([authenticatedUser, authorizePermissions("ADMIN")], deleteUser);

export default router;
