const dbConnection = require('../config/dbConnection');
const query = require('../config/queries');
const logger = require('../logs/logger');

module.exports = {
    getUserById(req, res) {
        let data = [];
        try {
            dbConnection.query(query.getUserById, (req.body.idNumber), (err, buRows, fields) => {
                if (!err) {
                    if (!buRows.length == 0) {
                        dbConnection.query(query.getByBranchCodeZoneCode, [buRows[0].BranchCode, buRows[0].ZoneCode], (err, brRows, fields) => {
                            if (!err) {
                                if (!brRows.length == 0) {
                                    data.push({ branchcode: buRows[0].BranchCode, zonecode: buRows[0].ZoneCode, fullname: buRows[0].fullname, email: buRows[0].EmailAddress, jobTitle: buRows[0].RoleID, region: brRows[0].regionname, area: brRows[0].areaname, branch: brRows[0].branchname });
                                    res.status(200).send({rows:data});
                                
                                    logger.loggerInfo.addContext('context', 'USERS CONTROLLER - getUserById');
                                    logger.loggerInfo.info(`200: SUCCESSFULLY RETRIEVED DATA`)
                                }
                                else{
                                    res.send({rows :data, message:"No data found."})
                                    logger.loggerError.addContext('context','USERS CONTROLLER - getUserById');
                                    logger.loggerError.error(`200: NO DATA FOUND FROM table_branches length: ${brRows.length}`)
                                }
                            }else{
                                res.send({rows :data, message:"Failed to retrieved data. Please try again"})
                                logger.loggerError.addContext('context', 'USERS CONTROLLER - getUserById')
                                logger.loggerError.error(`400: FAILED RETRIEVED DATA from table_branches - ${err}`)
                            }
                        })
                    }
                    else{
                        res.send({rows :data, message:"No data found. ID Number does not exist"})
                        logger.loggerError.addContext('context','USERS CONTROLLER - getUserById');
                        logger.loggerError.error(`200: NO DATA FOUND FROM table_sysuseraccounts_branchusers length: ${buRows.length}`)
                    }
                }else{
                    res.send({rows :data, message:"Failed to retrieved data. Please try again"})
                    logger.loggerError.addContext('context', 'USERS CONTROLLER - getUserById')
                    logger.loggerError.error(`400: FAILED RETRIEVED DATA from table_sysuseraccounts_branchusers - ${err}`)
                }
                
            })
        } catch (error) {
            res.send({rows :data, message:"Server error. Please refresh the page and try again."})
            logger.loggerFatal.addContext('context', 'USERS CONTROLLER - getUserById');
            logger.loggerFatal.fatal(`500: SERVER ERROR - ${error}`);
        }
    }
}