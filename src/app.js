import express from 'express';
import fs from 'fs/promises';
import initRoutes from './routes';
import mqttClient from './services/MQTTClient';

const app = express();

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

async function startServer() {
    const config = await loadConfig();
    const { server } = config;

    // Inicia el servidor Express
    initRoutes(app);

    const serverInstance = app.listen(server.port, () => {
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