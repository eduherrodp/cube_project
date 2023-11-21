import express from 'express';
import * as mqttController from '../controllers/mqttController';

const router = express.Router();

router.get('/mqtt-connect', mqttController.handleMQTTConnect);
router.post('/mqtt-send-message', mqttController.handleMQTTMessage);

export default router;