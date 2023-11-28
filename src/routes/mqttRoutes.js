/**
 * mqttRoutes.js
 * This file defines the MQTT-related routes for the Express app.
 * @module mqttRoutes
 */

import express from 'express';
import MQTTClient from '../services/MQTTClient.js';
import { loadConfig } from '../app.js';

const router = express.Router();

// Route for sending messages to MQTT broker
router.post('/send-message', async (req, res) => {
    try {
        const mqttConfig = await loadConfig();
        const { host, port, clientId, username, password, mountpoint } = mqttConfig.mqtt;
        const mqttClient = MQTTClient.getInstance({ host, port, clientId, username, password, mountpoint });

        const { message } = req.body;

        mqttClient.getClient().publish('/test/topic', message);
        res.json({ status: 'Message sent to MQTT broker', message });
    } catch (error) {
        console.error('Error in MQTT route: ', error.message);
    }
});

export default router;
