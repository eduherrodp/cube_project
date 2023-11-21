import expressRoutes from './expressRoutes';
import mqttRoutes from './mqttRoutes';

const initRoutes = (app) => {
    app.use(expressRoutes);
    app.use('/mqtt', mqttRoutes);
};

export default initRoutes;