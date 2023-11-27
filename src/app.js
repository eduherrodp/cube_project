/**
 * app.js
 * This file initializes the Express app, loads configuration, and starts the server.
 * @module app
 */

import express from 'express';
import fs from 'fs/promises';
import initRoutes from './routes/index.js';
import cors from 'cors';

const app = express();

/**
 * Loads configuration from the 'config_private.json' file.
 * @async
 * @function
 * @throws {Error} - If the configuration is invalid or loading fails.
 * @returns {Object} - Loaded configuration.
 */
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

export { loadConfig };

/**
 * Starts the Express server with configured middleware and routes.
 * @async
 * @function
 */
async function startServer() {
    const config = await loadConfig();

    app.use(express.json());
    app.use(
        cors({
            origin: ['https://app.smarttransit.online', 'https://api.smarttransit.online'],
            methods: 'POST',
            credentials: true,
            optionsSuccessStatus: 204,
            allowedHeaders: ['Content-Type', 'Authorization'],
            preflightContinue: false,
            maxAge: 3600,
        })
    );

    initRoutes(app);

    const serverInstance = app.listen(config.server.port, function () {
        console.log(`Server is running on port ${config.server.port}`);
    });

    process.on('SIGINT', () => {
        console.log('Server shutting down...');
        serverInstance.close(() => {
            console.log('Server closed.');
            process.exit(0);
        });
    });
}

startServer();