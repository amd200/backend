import express from "express";
import { createProperty, getAllProperties, getPropertyById, updateProperty, deleteProperty } from "../controllers/property.controller.js";
import { authenticatedUser, authorizePermissions } from "../middleware/authentication.js";
const router = express.Router();

router.route("/").post([authenticatedUser], createProperty).get(getAllProperties);

router.route("/:id").get(getPropertyById).patch([authenticatedUser], updateProperty).delete([authenticatedUser], deleteProperty);

export default router;
