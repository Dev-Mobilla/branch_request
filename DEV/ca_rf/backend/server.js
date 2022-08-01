const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const bodyParser = require('body-parser');
const cors = require('cors');
const Router = require('./router/router');
const logger = require('./logs/logger');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use('/', Router);

http.listen(PORT, () => {
    logger.loggerInfo.addContext('context', 'server.js - ');
    logger.loggerInfo.info(`Server listening to port: ${PORT}`)
    console.log(`Server listening to port: ${PORT}`);
    
})