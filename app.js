import express from 'express';
import * as MQTT_L from 'mqtt';
import fs from 'fs/promises';

const app = express();
const config = await loadConfig();
async function loadConfig() {
    try {
        const configContent = await fs.readFile('./config_private.json', 'utf-8');
        const config = JSON.parse(configContent);

        if (!config || !config.mqtt || !config.server) {
            throw new Error('Invalid configuration file.');
        }

        return config;
    } catch (error) {
        console.error('Error loading config: ', error.message);
        throw error;
    }
}

async function startServer(config) {
    const { mqtt, server } = config;
    
    const mqttClient = MQTT_L.connect(`ws://${mqtt.host}:${mqtt.port}/mqtt`, {
        clientId: mqtt.clientId,
        username: mqtt.username,
        password: mqtt.password,
    });

    // Manejar eventos del cliente MQTT
    mqttClient.on('connect', () => {
        console.log('Connected to MQTT broker: ' + mqtt.host);

        // Subscribirse al topic
        mqttClient.subscribe('/test/topic', (err) => {
            if(!err) {
                console.log('Subscribed to /test/topic');
            }
        });

        // Publicar un mensaje al conectar
        mqttClient.publish('/test/topic', `Client ${mqtt.clientId} has been connected`);
    });

    mqttClient.on('error', (err) => {
        console.error('MQTT connection error', err.message);
    })

    // Middleware para analizar el cuerpo de las solicitudes como JSON
    app.use(express.json());

    // Configurar rutas para la aplicación Express
    app.get('/', (req, res) => {
        res.send('Hello from Express!');
    });

    app.post('/send-message', (req, res) => {
        const { message } =  req.body;

        // Publicar el mensaje en el topic MQTT
        mqttClient.publish('/test/topic', message);
        res.json({ status: 'Message sent to MQTT broker', message});
    });

    const serverInstance = app.listen(server.port, function() {
        console.log(`Server is running on port ${server.port}`);
    });

    // Manejar la terminación del servidor
    process.on('SIGINT', () => {
        console.log('Server shutting down...');
        serverInstance.close(() => {
            console.log('Server closed.');
            process.exit(0);
        });
    });
}

startServer(config);