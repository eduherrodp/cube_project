import express from 'express';
import * as expressController from '../controllers/expressController';

const router = express.Router();

router.get('/', expressController.handleRoot);
router.post('/send-message', expressController.handleSendMessage);

export default router;