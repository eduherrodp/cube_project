// mqttRoutes.js
import express from 'express';
import MQTTClient from '../services/MQTTClient.js';
import { loadConfig } from '../app.js';

const router = express.Router();

router.post('/send-message', async (req, res) => {
    try {
        const mqttConfig = await loadConfig();
        // console.log(mqttConfig);

        const { host, port, clientId, username, password, mountpoint } = mqttConfig.mqtt;

        const mqttClient = new MQTTClient({ host, port, clientId, username, password, mountpoint });
        console.log(mqttClient);

        const { message } = req.body;

        // Publicar el mensaje en el topic MQTT
        mqttClient.getClient().publish('/test/topic', message);
        res.json({ status: 'Message sent to MQTT broker', message });
    } catch (error) {
        console.error('Error in MQTT route: ', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;