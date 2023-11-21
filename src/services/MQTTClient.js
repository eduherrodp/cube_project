import * as MQTT_L from 'mqtt';

class MQTTClient {
    constructor(mqttConfig) {
        this.client = MQTT_L.connect(`ws://${mqttConfig.host}:${mqttConfig.port}/mqtt`, {
            clientId: mqttConfig.clientId,
            username: mqttConfig.username,
            password: mqttConfig.password,
        });

        this.client.on('connect', () => {
            console.log('Connected to MQTT broker: ' + mqttConfig.host);
            this.client.subscribe('/test/topic', (err) => {
                if (!err) {
                    console.log('Subscribed to /test/topic');
                }
            });
            this.client.publish('/test/topic', `Client ${mqttConfig.clientId} has been connected`);
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