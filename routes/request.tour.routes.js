import express from 'express';
import {
  requestTour,
  getAllRequests,
  getRequestById,
} from '../controllers/request.tour.controller.js';
import { authenticatedUser } from '../middleware/authentication.js';
const router = express.Router();

router
  .route('/')
  .post([authenticatedUser], requestTour)
  .get([authenticatedUser], getAllRequests);

router.route('/:id').get([authenticatedUser], getRequestById);

export default router;
