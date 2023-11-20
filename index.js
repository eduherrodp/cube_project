const mqtt = require('mqtt');
const config = require("./config_private.json");

const { host, port, clientID, username, password } = config.connection;
const connectURL = `ws://${host}:${port}/mqtt`;

console.log(connectURL);

const client = mqtt.connect(connectURL, {
    clientId: clientID,
    clean: true,
    connectTimeout: 4000,
    username: username,
    password: password,
    reconnectPeriod: 1000,
});

const topic = '/nodejs/mqtt';

client.on('connect', () => {
    console.log('Connected');

    client.subscribe([topic], () => {
        console.log(`Subscribe to topic '${topic}'`);
        client.publish(topic, 'nodejs mqtt test', { qos: 0, retain: false }, (error => {
            if (error) {
                console.error(error);
            }
        }));
    });
});

client.on('message', (topic, payload) => {
    console.log('Received Message:', topic, payload.toString());
});