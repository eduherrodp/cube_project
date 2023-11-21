import mqttClient from '../services/MQTTClient';

export const handleMQTTConnect = (req, res) => {
    const client = mqttClient.getClient();
    res.json({ status: 'Connected to MQTT broker' });
};

export const handleMQTTMessage = (req, res) => {
    const { message } = req.body;
    const client = mqttClient.getClient();

    client.publish('/test/topic', message, (err) => {
        if (err) {
            console.error('Error publishing message to /test/topic: ', err.message);
            res.status(500).json({ status: 'Error publishing message', error: err.message });
        } else res.json({ status: 'Message sent to MQTT broker', message });
    });
};