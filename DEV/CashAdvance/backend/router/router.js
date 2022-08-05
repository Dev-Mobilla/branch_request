const express = require('express');
const Router = express.Router();

// const requestController = require('../controllers/requestController');
// const usersController = require('../controllers/usersController');
// const mailController = require('./');
const usersController = require('../controllers/usersController');
const mailController = require('../controllers/mailController');
const requestController = require('../controllers/requestController');


Router.get('/test', mailController.testing);
Router.post('/request', requestController.postRequest);
Router.get('/send', mailController.send)

//REVOLVING FUND
Router.get('/getRfMaxId', requestController.getRfMaxId);

Router.post('/rf_request', requestController.post_RfRequest);
Router.post('/rfRequestFlow/:controlNo/:approver', mailController.rfRequestFlow);

//CASH ADVANCE
Router.get('/getMaxId', requestController.getMaxId);

Router.post('/getUserById', usersController.getUserById);
Router.post('/getComment', mailController.getComment );
Router.post('/requestStatus/:controlNo/:approver', mailController.requestStatus);

module.exports = Router;