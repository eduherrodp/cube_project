import * as MQTT_L from 'mqtt';

class MQTTClient {
    constructor({ host, port, clientId, username, password, mountpoint = '/mqtt' }) {
        // console.log('Received MQTT config:', { host, port, clientId, username, password, mountpoint });

        if (!host || !port) {
            throw new Error('Invalid MQTT configuration: host and port are required.');
        }

        this.mqttUrl = `ws://${host}:${port}${mountpoint}`;
        this.connect();
    }

    connect() {
        this.client = MQTT_L.connect(this.mqttUrl, {
            clientId: this.clientId,
            username: this.username,
            password: this.password,
        });

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.client.on('connect', () => {
            console.log('Connected to MQTT broker: ' + this.host);
            this.client.subscribe('/test/topic', (err) => {
                if (!err) {
                    console.log('Subscribed to /test/topic');
                }
            });
            this.client.publish('/test/topic', `Client ${this.clientId} has been connected`);
        });

        this.client.on('error', (err) => {
            console.error('MQTT connection error', err.message);
            this.scheduleReconnect();
        });

        this.client.on('close', () => {
            console.log('Connection to MQTT broker closed');
            this.scheduleReconnect();
        });
    }

    scheduleReconnect() {
        // Intentar la reconexión después de un intervalo de tiempo
        setTimeout(() => {
            console.log('Attempting to reconnect to MQTT broker...');
            this.connect();
        }, 5000);
    }

    getClient() {
        return this.client;
    }
}

export default MQTTClient;