import express from 'express';
import ClassesController from './controllers/ClassesControlers';
import ConnectionsController from './controllers/ConnectionsControllers';

const routes = express.Router();
const classesController = new ClassesController();
const connectionsController = new ConnectionsController();

routes.get('/classes', classesController.index);
routes.post('/classes', classesController.create);

// routes.get('/connections', connectionsController.index);
routes.get('/connections', async (request, response) => {
    console.log('rout conn', request);
    return response.send();
});
routes.post('/connections', connectionsController.create);

export default routes;