const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const bodyParser = require('body-parser');
const cors = require('cors');
const Router = require('./router/router');
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use('/', Router);

http.listen(PORT, () => {

    console.log(`Server listening to port: ${PORT}`);
    
})