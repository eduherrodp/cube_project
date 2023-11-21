import express from 'express';
import MQTTClient from '../services/MQTTClient.js';
import { loadConfig } from '../app.js';

const router = express.Router();

router.post('/send-message', async (req, res) => {
    try {
        const mqttConfig = await loadConfig();
        const { host, port, clientId, username, password, mountpoint } = mqttConfig.mqtt;
        // Obtener la instancia única de MQTTClient
        const mqttClient = MQTTClient.getInstance({ host, port, clientId, username, password, mountpoint });

        const { message } = req.body;

        // Publicar el mensaje en el topic MQTT
        mqttClient.getClient().publish('/test/topic', message);
        res.json({ status: 'Message sent to MQTT broker', message });
    } catch (error) {
        console.error('Error in MQTT route: ', error.message);
    }
});

export default router;