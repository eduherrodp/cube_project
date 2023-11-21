import expressRoutes from './expressRoutes.js';
import mqttRoutes from './mqttRoutes.js';

const initRoutes = (app) => {
    app.use(expressRoutes);
    app.use(mqttRoutes);
};

export default initRoutes;