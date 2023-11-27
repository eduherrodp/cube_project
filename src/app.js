/**
 * MQTTClient.js
 * This file defines the MQTTClient class for handling MQTT connections.
 * @module MQTTClient
 */

import * as MQTT_L from 'mqtt';

class MQTTClient {
    static instance = null;

    /**
     * Gets the instance of the MQTTClient class.
     * @static
     * @function
     * @param {Object} config - MQTT configuration parameters.
     * @returns {MQTTClient} - Instance of the MQTTClient class.
     */
    static getInstance(config) {
        if (!MQTTClient.instance) {
            MQTTClient.instance = new MQTTClient(config);
        }
        return MQTTClient.instance;
    }

    /**
     * Constructor for the MQTTClient class.
     * @constructor
     * @param {Object} config - MQTT configuration parameters.
     */
    constructor({ host, port, clientId, username, password, mountpoint = '/mqtt' }) {
        this.host = host;
        this.port = port;
        this.clientId = clientId;
        this.username = username;
        this.password = password;
        this.mountpoint = mountpoint;

        if (!host || !port) {
            throw new Error('Invalid MQTT configuration: host and port are required.');
        }

        this.connectToBroker();
    }

    /**
     * Connects to the MQTT broker.
     * @function
     */
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

    /**
     * Checks if the client is connected to the MQTT broker.
     * @function
     * @returns {boolean} - True if connected, false otherwise.
     */
    isConnected() {
        return this.client && this.client.connected;
    }

    /**
     * Gets the MQTT client instance.
     * @function
     * @returns {Object} - MQTT client instance.
     */
    getClient() {
        return this.client;
    }
}

export default MQTTClient;
