// MQTTClient.js
import * as MQTT_L from 'mqtt';

class MQTTClient {
    constructor({ host, port, clientId, username, password, mountpoint = '/mqtt' }) {
        // console.log('Received MQTT config:', { host, port, clientId, username, password, mountpoint });

        if (!host || !port) {
            throw new Error('Invalid MQTT configuration: host and port are required.');
        }

        const mqttUrl = `ws://${host}:${port}${mountpoint}`;

        this.client = MQTT_L.connect(mqttUrl, {
            clientId,
            username,
            password,
        });

        this.client.on('connect', () => {
            console.log('Connected to MQTT broker: ' + host);
            this.client.subscribe('/test/topic', (err) => {
                if (!err) {
                    console.log('Subscribed to /test/topic');
                }
            });
            this.client.publish('/test/topic', `Client ${clientId} has been connected`);
        });

        this.client.on('error', (err) => {
            console.error('MQTT connection error', err.message);
        });
    }

    getClient() {
        return this.client;
    }
}

export default MQTTClient;
