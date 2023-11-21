import * as MQTT_L from 'mqtt';

class MQTTClient {

    // Propiedad estática para almacenar la instancia única
    static instance = null;

    // Método estático para obtener la instancia única
    static getInstance(config) {
        if (!MQTTClient.instance) {
            MQTTClient.instance = new MQTTClient(config);
        } return MQTTClient.instance;
    }

    constructor({ host, port, clientId, username, password, mountpoint = '/mqtt' }) {
        // console.log('Received MQTT config:', { host, port, clientId, username, password, mountpoint });
        this.host = host;
        this.port = port;
        this.clientId = clientId;
        this.username = username;
        this.password = password;
        this.mountpoint = mountpoint;

        if (!host || !port) {
            throw new Error('Invalid MQTT configuration: host and port are required.');
        }

        // Para subscribirse en automático, la lógica de subscripción se mueve al constructor
        this.connectToBroker();
        this.subscribeToTopic();
    }
    
    connectToBroker() {
        if (!this.isConnected()) {
            const mqttUrl = `ws://${this.host}:${this.port}${this.mountpoint}`;
    
            this.client = MQTT_L.connect(mqttUrl, {
                clientId: this.clientId,
                username: this.username,
                password: this.password,
            });
    
            this.client.on('connect', () => {
                console.log(`Connected to MQTT broker: ${this.host}`);
                this.client.subscribe('/test/topic', (err) => {
                    if (!err) {
                        console.log('Subscribed to /test/topic');
                    }
                });
                this.client.publish('/test/topic', `Client ${this.clientId} has been connected`);
            });
    
            this.client.on('error', (err) => {
                console.error('MQTT connection error', err.message);
            });
        }
    }

    isConnected() {
        return this.client && this.client.connected;
    }

    getClient() {
        return this.client;
    }
}

export default MQTTClient;