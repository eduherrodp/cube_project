import express from 'express';
import * as mqttController from '../controllers/mqttController';

const router = express.Router();

router.get('/connect', mqttController.handleMQTTConnect);
router.post('/send-message', mqttController.handleMQTTMessage);

export default router;