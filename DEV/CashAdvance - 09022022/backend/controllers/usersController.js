const dbConnection = require('../config/dbConnection');
const query = require('../config/queries');
const logger = require('../logs/logger');
const setTransporter = require('../config/mailConfig');
const passport = require('passport');



const sendEmail = async (options) => {
    let gmailTransporter = await setTransporter();
    return await gmailTransporter.sendMail(options);
};

module.exports = {
    // getUserById(req, res) {
    //     let data = [];
    //     try {
    //         dbConnection.query(query.getUserById, (req.body.idNumber), (err, buRows, fields) => {
    //             if (!err) {
    //                 if (!buRows.length == 0) {
    //                     dbConnection.query(query.getByBranchCodeZoneCode, [buRows[0].BranchCode, buRows[0].ZoneCode], (err, brRows, fields) => {
    //                         if (!err) {
    //                             if (!brRows.length == 0) {
    //                                 data.push({ branchcode: buRows[0].BranchCode, zonecode: buRows[0].ZoneCode, fullname: buRows[0].fullname, email: buRows[0].EmailAddress, jobTitle: buRows[0].RoleID, region: brRows[0].regionname, area: brRows[0].areaname, branch: brRows[0].branchname });
    //                                 res.status(200).send({ rows: data });

    //                                 logger.loggerInfo.addContext('context', 'USERS CONTROLLER - getUserById');
    //                                 logger.loggerInfo.info(`200: SUCCESSFULLY RETRIEVED DATA`)
    //                             }
    //                             else {
    //                                 res.send({ rows: data, message: "No data found." })
    //                                 logger.loggerError.addContext('context', 'USERS CONTROLLER - getUserById');
    //                                 logger.loggerError.error(`200: NO DATA FOUND FROM table_branches length: ${brRows.length}`)
    //                             }
    //                         } else {
    //                             res.send({ rows: data, message: "Failed to retrieved data. Please try again" })
    //                             logger.loggerError.addContext('context', 'USERS CONTROLLER - getUserById')
    //                             logger.loggerError.error(`400: FAILED RETRIEVED DATA from table_branches - ${err}`)
    //                         }
    //                     })
    //                 }
    //                 else {
    //                     res.send({ rows: data, message: "No data found. ID Number does not exist" })
    //                     logger.loggerError.addContext('context', 'USERS CONTROLLER - getUserById');
    //                     logger.loggerError.error(`200: NO DATA FOUND FROM table_sysuseraccounts_branchusers length: ${buRows.length}`)
    //                 }
    //             } else {
    //                 res.send({ rows: data, message: "Failed to retrieved data. Please try again" })
    //                 logger.loggerError.addContext('context', 'USERS CONTROLLER - getUserById')
    //                 logger.loggerError.error(`400: FAILED RETRIEVED DATA from table_sysuseraccounts_branchusers - ${err}`)
    //             }

    //         })
    //     } catch (error) {
    //         res.send({ rows: data, message: "Server error. Please refresh the page and try again." })
    //         logger.loggerFatal.addContext('context', 'USERS CONTROLLER - getUserById');
    //         logger.loggerFatal.fatal(`500: SERVER ERROR - ${error}`);
    //     }
    // },
    getUserByEmail(req, res) {
        let data = [];
        try {
            dbConnection.query(query.getUserByEmail, (req.body.email), (err, buRows, fields) => {
                if (!err) {
                    if (!buRows.length == 0) {
                        console.log(buRows[0]);
                        dbConnection.query(query.getByBranchCodeZoneCode, [buRows[0].BranchCode, buRows[0].ZoneCode], (err, brRows, fields) => {
                            if (!err) {
                                if (!brRows.length == 0) {
                                    console.log(brRows[0]);
                                    data.push({ branchcode: buRows[0].BranchCode, zonecode: buRows[0].ZoneCode, fullname: buRows[0].fullname, email: buRows[0].EmailAddress, jobTitle: buRows[0].RoleID, resourceId: buRows[0].ResourceID , region: brRows[0].regionname, area: brRows[0].areaname, branch: brRows[0].branchname });
                                    res.status(200).send({ rows: data[0], statusCode:200, message: 'Logged in Successfully' });

                                    logger.loggerInfo.addContext('context', 'USERS CONTROLLER - getUserByEmail');
                                    logger.loggerInfo.info(`200: SUCCESSFULLY RETRIEVED DATA`);
                                }
                                else {
                                    res.send({ rows: data, message: "No data found.", statusCode:404 })
                                    logger.loggerError.addContext('context', 'USERS CONTROLLER - getUserByEmail');
                                    logger.loggerError.error(`200: NO DATA FOUND FROM table_branches length: ${brRows.length}`)
                                }
                            } else {
                                res.send({ rows: data, message: "Failed to retrieved data. Please try again", statusCode:400 })
                                logger.loggerError.addContext('context', 'USERS CONTROLLER - getUserByEmail')
                                logger.loggerError.error(`400: FAILED RETRIEVED DATA from table_branches - ${err}`)
                            }
                        })
                    }
                    else {
                        res.send({ rows: data, message: "No user found. Email Address does not exist",  statusCode:404 })
                        logger.loggerError.addContext('context', 'USERS CONTROLLER - getUserByEmail');
                        logger.loggerError.error(`404: NO DATA FOUND FROM table_sysuseraccounts_branchusers length: ${buRows.length}`)
                    }
                } else {
                    res.send({ rows: data, message: "Failed to retrieved data. Please try again", statusCode:400 })
                    logger.loggerError.addContext('context', 'USERS CONTROLLER - getUserByEmail')
                    logger.loggerError.error(`400: FAILED RETRIEVED DATA from table_sysuseraccounts_branchusers - ${err}`)
                }

            })
        } catch (error) {
            res.status(500).send({ rows: data, message: "Server error. Please refresh the page and try again.", statusCode:500 })
            logger.loggerFatal.addContext('context', 'USERS CONTROLLER - getUserById');
            logger.loggerFatal.fatal(`500: SERVER ERROR - ${error}`);
        }
    },
    getUserByEmailRevolvingFund(req, res) {
        let data = [];
        try {
            dbConnection.query(query.getUserByEmail, (req.body.email), (err, buRows, fields) => {
                if (!err) {
                    if (!buRows.length == 0) {
                        console.log(buRows[0]);
                        dbConnection.query(query.getByBranchCodeZoneCode, [buRows[0].BranchCode, buRows[0].ZoneCode], (err, brRows, fields) => {
                            if (!err) {
                                if (!brRows.length == 0) {
                                    data.push({ branchcode: buRows[0].BranchCode, zonecode: buRows[0].ZoneCode, fullname: buRows[0].fullname, email: buRows[0].EmailAddress, jobTitle: buRows[0].RoleID, resourceId: buRows[0].ResourceID , region: brRows[0].regionname, area: brRows[0].areaname, branch: brRows[0].branchname });
                                    res.status(200).send({ rows: data[0], statusCode:200, message: 'Logged in Successfully' });

                                    logger.loggerInfo.addContext('context', 'USERS CONTROLLER - getUserByEmail');
                                    logger.loggerInfo.info(`200: SUCCESSFULLY RETRIEVED DATA`);
                                }
                                else {
                                    res.status(404).send({ rows: data, message: "No data found.", statusCode:404 })
                                    logger.loggerError.addContext('context', 'USERS CONTROLLER - getUserByEmail');
                                    logger.loggerError.error(`200: NO DATA FOUND FROM table_branches length: ${brRows.length}`)
                                }
                            } else {
                                res.status(400).send({ rows: data, message: "Failed to retrieved data. Please try again", statusCode:400 })
                                logger.loggerError.addContext('context', 'USERS CONTROLLER - getUserByEmail')
                                logger.loggerError.error(`400: FAILED RETRIEVED DATA from table_branches - ${err}`)
                            }
                        })
                    }
                    else {
                        res.status(404).send({ rows: data, message: "No data found. Email Address does not exist",  statusCode:404 })
                        logger.loggerError.addContext('context', 'USERS CONTROLLER - getUserByEmail');
                        logger.loggerError.error(`404: NO DATA FOUND FROM table_sysuseraccounts_branchusers length: ${buRows.length}`)
                    }
                } else {
                    res.status(400).send({ rows: data, message: "Failed to retrieved data. Please try again", statusCode:400 })
                    logger.loggerError.addContext('context', 'USERS CONTROLLER - getUserByEmail')
                    logger.loggerError.error(`400: FAILED RETRIEVED DATA from table_sysuseraccounts_branchusers - ${err}`)
                }

            })
        } catch (error) {
            res.status(500).send({ rows: data, message: "Server error. Please refresh the page and try again.", statusCode:500 })
            logger.loggerFatal.addContext('context', 'USERS CONTROLLER - getUserById');
            logger.loggerFatal.fatal(`500: SERVER ERROR - ${error}`);
        }
    },

}