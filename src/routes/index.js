/**
 * index.js
 * This file initializes and exports the routes for the Express app.
 * @module initRoutes
 */

import expressRoutes from './expressRoutes.js';
import mqttRoutes from './mqttRoutes.js';

/**
 * Initializes routes for the Express app.
 * @function
 * @param {Object} app - Express application object.
 */
const initRoutes = (app) => {
    app.use(expressRoutes);
    app.use(mqttRoutes);
};

export default initRoutes;
