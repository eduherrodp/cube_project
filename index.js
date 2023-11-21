import express from 'express';
import * as mqtt from 'mqtt';
import bodyParser from 'body-parser'; // Importamos bodyParser para manejar el cuerpo de la solicitud POST
import fs from 'fs/promises';

const app = express();

// Configuramos bodyParser para manejar solicitudes con cuerpo JSON
app.use(bodyParser.json());

const configPath = './config_private.json';

async function loadConfig() {
    try {
        const configContent = await fs.readFile(configPath, 'utf-8');
        return JSON.parse(configContent);
    } catch (error) {
        console.error('Error loading config:', error);
        process.exit(1);
    }
}

async function startServer() {
    const config = await loadConfig();
    const { host, port, clientID, username, password } = config.connection;

    const mqttClient = mqtt.connect(`ws://${host}:${port}/mqtt`, {
        clientId: clientID,
        username: username,
        password: password,
    });

    // Connect to the MQTT broker
    mqttClient.on('connect', function () {
        console.log('Connected to MQTT broker');
    });

    app.use(function (req, res, next) {
        // Publish messages
        req.mqttPublish = function (topic, message) {
            mqttClient.publish(topic, message);
        };

        // Subscribe to topic
        req.mqttSubscribe = function (topic, callback) {
            mqttClient.subscribe(topic);
            mqttClient.on('message', function (t, m) {
                if (t === topic) {
                    callback(m.toString());
                }
            });
        };
        next();
    });

    // Modificamos la ruta para aceptar solicitudes POST con un cuerpo JSON
    app.post('/', function (req, res) {
        // Obtener la cadena de texto del cuerpo de la solicitud
        const textMessage = req.body.message || 'Default Message';

        // Publicar la cadena de texto en el tema MQTT 'test'
        req.mqttPublish('test', textMessage);

        res.json({ message: 'MQTT message sent', textMessage });
    });

    const server = app.listen(3000, function () {
        console.log('Server is running on port 3000');
    });

    // Manejar la terminación del servidor
    process.on('SIGINT', function () {
        console.log('Server shutting down...');
        server.close(function () {
            console.log('Server closed.');
            process.exit(0);
        });
    });
}

startServer();