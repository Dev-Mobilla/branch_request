const mysql = require('mysql');
const logger = require('../logs/logger');


const branchdbConnection = mysql.createPool({
    host: process.env.BRANCH_DB_HOST,
    user:process.env.BRANCH_DB_USER,
    password:process.env.BRANCH_DB_PASSWORD,
    database:process.env.BRANCH_DB_NAME,
    port:process.env.BRANCH_DB_PORT
})

branchdbConnection.getConnection((err) => {
    if (!err) {
        logger.loggerInfo.addContext('context', `${process.env.BRANCH_DB_HOST} - ${process.env.BRANCH_DB_NAME} -`);
        logger.loggerInfo.info('Branch Connected.')
        
    } else {
        logger.loggerFatal.addContext('context', `${process.env.BRANCH_DB_HOST} - ${process.env.BRANCH_DB_NAME} -`);
        logger.loggerFatal.fatal(`Branch Connection Failed. ${err}`)
    }
})

module.exports = branchdbConnection;