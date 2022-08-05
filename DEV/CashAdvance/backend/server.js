const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const bodyParser = require('body-parser');
const cors = require('cors');
const Router = require('./router/router');
const logger = require('./logs/logger');
const path = require('path');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//must
app.use(express.static(path.resolve(__dirname, '../frontend/dist')))
app.get('/', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
});

app.use('/', Router);

http.listen(PORT, () => {
    logger.loggerInfo.addContext('context', 'server.js - ');
    logger.loggerInfo.info(`Server listening to port: ${PORT}`)
    console.log(`Server listening to port: ${PORT}`);
    
})