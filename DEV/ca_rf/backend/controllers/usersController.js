const dbConnection = require('../config/dbConnection');
const query = require('../config/queries');
const logger = require('../logs/logger');

module.exports = {
    //route('/')
    // getUserById (req,res) {
    //     console.log(req.body.idNumber);
    //     dbConnection.query(query.getUserById,(req.body.idNumber), (err, rows, fields) => {
    //         if (!err) {
    //             if (!rows.length == 0) {
    //                 res.send({rows:rows});
    //             }else{
    //                 console.log(rows.length);
    //                 res.send({rows :rows, message:"No data found"})
    //             }
    //         }
    //         else{
    //             res.send({message:"Something's wrong. Please try again."})
    //         }
    //     })
    // },
    getUserById(req, res) {
        console.log(req.body.idNumber);
        let data = [];
        try {
            dbConnection.query(query.getUserById, (req.body.idNumber), (err, buRows, fields) => {
                console.log(buRows.length);
                console.log(buRows[0]);
                if (!err) {
                    if (!buRows.length == 0) {
                        dbConnection.query(query.getByBranchCodeZoneCode, [buRows[0].BranchCode, buRows[0].ZoneCode], (err, brRows, fields) => {
                            if (!err) {
                                console.log(brRows.length);
                                if (!brRows.length == 0) {
                                    data.push({ branchcode: buRows[0].BranchCode, zonecode: buRows[0].ZoneCode, fullname: buRows[0].fullname, email: buRows[0].EmailAddress, jobTitle: buRows[0].RoleID, region: brRows[0].regionname, area: brRows[0].areaname, branch: brRows[0].branchname });
                                    res.status(200).send({rows:data});
                                
                                    logger.loggerInfo.addContext('context', 'CONTROLLER - getUserById');
                                    logger.loggerInfo.info(`200: SUCCESSFULLY RETRIEVED DATA`)
                                }
                                else{
                                    res.send({rows :data, message:"No data found."})
                                    logger.loggerError.addContext('context','CONTROLLER - getUserById');
                                    logger.loggerError.error(`200: NO DATA FOUND FROM table_branches`)
                                }
                            }else{
                                res.send({rows :data, message:"Failed to retrieved data. Please try again"})
                                logger.loggerError.addContext('context', 'CONTROLLER - getUserById')
                                logger.loggerError.error(`400: FAILED RETRIEVED DATA from table_branches - ${err}`)
                            }
                        })
                    }
                    else{
                        res.send({rows :data, message:"No data found. ID Number does not exist"})
                        logger.loggerError.addContext('context','CONTROLLER - getUserById');
                        logger.loggerError.error(`200: NO DATA FOUND FROM table_sysuseraccounts_branchusers`)
                    }
                }else{
                    res.send({rows :data, message:"Failed to retrieved data. Please try again"})
                    logger.loggerError.addContext('context', 'CONTROLLER - getUserById')
                    logger.loggerError.error(`400: FAILED RETRIEVED DATA from table_sysuseraccounts_branchusers - ${err}`)
                }
                
            })
        } catch (error) {
            res.send({rows :data, message:"Server error. Please refresh the page and try again."})
            logger.loggerFatal.addContext('context', 'CONTROLLER - getUserById');
            logger.loggerFatal.fatal(`500: SERVER ERROR - ${error}`);
        }
    }
}