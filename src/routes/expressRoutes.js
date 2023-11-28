/**
 * expressRoutes.js
 * This file defines the Express router and its routes.
 * @module expressRoutes
 */

import express from 'express';
import expressController from '../controllers/expressController.js';

const router = express.Router();

// Route for the root endpoint
router.get('/', expressController.getHello);

export default router;
