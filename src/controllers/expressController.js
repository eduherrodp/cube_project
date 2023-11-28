/**
 * expressController.js
 * This file contains the controller for handling Express routes.
 * @module expressController
 */

const expressController = {
    /**
     * Handles GET request for the root endpoint.
     * @function
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     */
    getHello: (req, res) => {
        res.send('Hello from Express!\n\nsmarttransit.online');
    },
};

export default expressController;
