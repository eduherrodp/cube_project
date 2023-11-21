import mqttClient from '../services/MQTTClient';

export const handleMQTTConnect = (req, res) => {
    const client = mqttClient.getClient();
    res.json({ status: 'Connected to MQTT broker' });
};

export const handleMQTTMessage = (req, res) => {
    const { message } = req.body;
    const client = mqttClient.getClient();

    client.publish('/test/topic', message);
    res.json({ status: 'Message sent to MQTT broker', message });
};