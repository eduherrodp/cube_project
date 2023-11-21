import express from 'express';
import expressController from '../controllers/expressController.js';

const router = express.Router();

router.get('/', expressController.getHello);

export default router;