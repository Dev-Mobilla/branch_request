const branchdbConnection = require('../config/branchDBConnection');
const dbConnection = require('../config/dbConnection');
const kpdbConnection = require('../config/dbConnection');
const query = require('../config/queries');
const Logger = require('../logs/logger');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const setTransporter = require('../config/mailConfig');
const { _createPdfStream, _streamToBuffer } = require('../utils/generatePdf');
const { sendEmailRf, sendRfRequestor } = require('./mailController');
const mailController = require('./mailController');

const sendEmail = async (options) => {
    let gmailTransporter = await setTransporter();
    return await gmailTransporter.sendMail(options);
};

module.exports = {
    getMaxId(req, res) {
        console.log('fdsfgdgfg');
        try {
            branchdbConnection.query(query.getMaxId, (err, row, fields) => {
                if (!err) {
                    if (!row.length == 0) {
                        console.log(row[0]);
                        Logger.loggerInfo.addContext('context', `requestController - getMaxId - `);
                        Logger.loggerInfo.info(`row: ${row.length}`)
                        res.send(row[0])
                    } else {
                        Logger.loggerError.addContext('context', 'requestController - getMaxId - ');
                        Logger.loggerError.error(`No ID found row: ${row.length}`);
                        res.send({ id: 0 })
                    }
                } else {
                    Logger.loggerError.addContext('context', 'requestController - getMaxId - ');
                    Logger.loggerError.error(`Error retrieving ID ${err}`);
                    res.send({ message: "Error ID retrieval." })
                }
            })
        } catch (error) {
            Logger.loggerFatal.addContext('context', 'requestController - getMaxId - ');
            Logger.loggerFatal.fatal(`Method Error - ${error}`);
            res.send({ message: "Error ID retrieval." })
        }
    },
    getRfMaxId(req, res) {
        try {
            branchdbConnection.query(query.getRfMaxId, (err, row, fields) => {
                if (!err) {
                    if (!row.length == 0) {
                        Logger.loggerInfo.addContext('context', `requestController - getRfMaxId - `);
                        Logger.loggerInfo.info(`row: ${row.length}`)
                        res.send(row[0])
                    } else {
                        Logger.loggerError.addContext('context', 'requestController - getRfMaxId - ');
                        Logger.loggerError.error(`No ID found row: ${row.length}`);
                        res.send({ id: 0 })
                    }
                } else {
                    Logger.loggerError.addContext('context', 'requestController - getRfMaxId - ');
                    Logger.loggerError.error(`Error retrieving ID ${err}`);
                    res.send({ message: "Error ID retrieval." })
                }
            })
        } catch (error) {
            Logger.loggerFatal.addContext('context', 'requestController - getRfMaxId - ');
            Logger.loggerFatal.fatal(`Method Error - ${error}`);
            res.send({ message: "Error ID retrieval." })
        }
    },
    postRequest(req, res) {
        Logger.loggerInfo.addContext('context', 'requestController - postRequest - ');
        Logger.loggerInfo.info(`DATA: ${req.body}`);
        try {
            // let area = (req.body.data.area).substr(15);
            // let region = (req.body.data.region).substr(4);
            branchdbConnection.query(
                `SELECT am.fullname AS am_fullname, am.email AS am_email, rm.fullname AS rm_fullname, rm.email AS rm_email, ram.fullname AS ram_fullname, 
                ram.email AS ram_email, ass.fullname AS ass_fullname, ass.email AS ass_email, vpo.fullname AS vpo_fullname, vpo.email AS vpo_email FROM am_approvers am
                INNER JOIN rm_approvers rm ON am.regionname = rm.regionname
                INNER JOIN ram_approvers ram ON am.regionname = ram.regionname
                INNER JOIN ass_vpo_approvers ass ON am.regionname = ass.regionname
                INNER JOIN vpo_approver vpo ON am.regionname = vpo.regionname
                WHERE am.regionname LIKE '%${req.body.data.region}%' AND am.areaname LIKE '%${req.body.data.area}%'`,
                // `SELECT am.fullname AS am_fullname, am.email AS am_email, rm.fullname AS rm_fullname, rm.email AS rm_email, ram.fullname AS ram_fullname, 
                // ram.email AS ram_email, ass.fullname AS ass_fullname, ass.email AS ass_email, vpo.fullname AS vpo_fullname, vpo.email AS vpo_email FROM am_approvers am
                // INNER JOIN rm_approvers rm ON am.regionname = rm.regionname
                // INNER JOIN ram_approvers ram ON am.regionname = ram.regionname
                // INNER JOIN ass_vpo_approvers ass ON am.regionname = ass.regionname
                // INNER JOIN vpo_approver vpo ON am.regionname = vpo.regionname
                // WHERE am.regionname LIKE '%TEST%' AND am.areaname LIKE '%TEST%'`,
                (err, approverRows, fields) => {
                    if (!err) {
                        if (!approverRows.length == 0) {
                            try {
                                branchdbConnection.query(query.postRequest,
                                    [
                                        req.body.data.idNumber, req.body.data.author, req.body.data.jobTitle,
                                        req.body.data.branch, req.body.data.area, req.body.data.region, req.body.data.email, req.body.data.purpose,
                                        req.body.data.controlNo, req.body.data.date, req.body.data.travelDate, req.body.data.departureDate,
                                        req.body.data.arrivalDate, req.body.data.amount, approverRows[0].am_email, '','', approverRows[0].rm_email, '','',
                                        approverRows[0].ram_email, '','', approverRows[0].ass_email, '','', approverRows[0].vpo_email, '','', 'pending'
                                    ], (err, fields) => {
                                        if (!err) {
                                            try {
                                                branchdbConnection.query(query.getRequestByControlNo, (req.body.data.controlNo), (err, request_rows, fields) => {
                                                    if (!err) {
                                                        if (!request_rows.length == 0) {
                                                            mailController.sendMail(request_rows).then(response => {
                                                                if (response.accepted) {
                                                                    mailController.sendEmailNotificationRequestor(request_rows).then(resp => {
                                                                        if (resp.accepted) {
                                                                            Logger.loggerInfo.addContext('context', 'requestController - postRequest - Request Submitted Successfully');
                                                                            Logger.loggerInfo.info(`sendEmailNotificationRequestor - ${resp.messageId} - ${resp.accepted}`);
                                                                            res.send({ message: 'Request submitted successfully' })
                                                                        } else if (resp.rejected) {
                                                                            Logger.loggerError.addContext('context', 'requestController - postRequest - Network error');
                                                                            Logger.loggerInfo.error(`sendEmailNotificationRequestor - ${resp.messageId} - ${resp.rejected}`);
                                                                            res.send({ message: 'Network error' })
                                                                        }
                                                                    }).catch(err => {
                                                                        Logger.loggerError.addContext('context', 'requestController - postRequest - Network Error -');
                                                                        Logger.loggerError.error(`sendEmailNotificationRequestor ${err}`)
                                                                        res.send({ message: 'Network error' })
                                                                    })
                                                                }
                                                                else if (response.rejected) {
                                                                    Logger.loggerError.addContext('context', 'requestController - postRequest - Failed to submit request');
                                                                    Logger.loggerInfo.error(`sendMail - ${response.messageId} - ${response.rejected}`);
                                                                    res.status(400).send({ message: 'Failed to submit request' })
                                                                }
                                                            }).catch(err => {
                                                                Logger.loggerError.addContext('context', 'requestController - postRequest - Network Error -');
                                                                Logger.loggerError.error(`sendMail ${err}`)
                                                                res.send({ message: 'Network error' })
                                                            })
                                                        } else {
                                                            Logger.loggerError.addContext('context', 'requestController - postRequest - ');
                                                            Logger.loggerError.error(`No data found request_rows: ${request_rows.length}`)
                                                            res.status(400).send({ message: 'Failed to submit request' })
                                                        }
                                                    } else {
                                                        Logger.loggerError.addContext('context', 'requestController - postRequest - ');
                                                        Logger.loggerError.error(`ERR REQUEST_BY_CONTROLID ${err}`);
                                                        res.status(404).send({ message: 'Failed to submit request' })
                                                    }
                                                })
                                            } catch (error) {
                                                Logger.loggerError.addContext('context', 'requestController - postRequest - ');
                                                Logger.loggerError.error(`ERR REQUEST_BY_CONTROLID ${error}`);
                                                res.status(404).send({ message: 'Failed to submit request' });
                                            }
                                        }
                                        else {
                                            Logger.loggerError.addContext('context', 'requestController - postRequest - ');
                                            Logger.loggerError.error(`Failed to submit request ${err}`);
                                            res.status(400).send({ message: 'Failed to submit request' })
                                        }
                                    })
                            } catch (error) {
                                Logger.loggerError.addContext('context', 'requestController - postRequest -');
                                Logger.loggerError.error(`Insertion Failed ${error}`);
                                res.status(400).send({ message: 'Failed to submit request' });
                            }

                        } else {
                            Logger.loggerError.addContext('context', 'requestController - postRequest -');
                            Logger.loggerError.error(`No Approvers found approversRows: ${approverRows.length}`);
                            res.status(404).send({ message: 'Failed to submit request' })
                        }

                    } else {
                        Logger.loggerError.addContext('context', 'requestController - postRequest');
                        Logger.loggerError.error(`Error retrieving approvers ${err}`)
                    }
                })

        } catch (error) {
            Logger.loggerFatal.addContext('context', 'requestController - postRequest');
            Logger.loggerFatal.fatal(`Method Error ${error}`);
            res.status(500).send({ message: "Something's wrong in the server. Please refresh the page and try again." });
        }

    },
    post_RfRequest(req, res) {

        try {

            switch (req.body.data.type) {
                case "Branch Manager":
                    try {
                        Logger.loggerInfo.addContext('context', 'requestController - post_RfRequest -');
                        Logger.loggerInfo.info(`Requestor Type: Branch Manager`);
                        dbConnection.query(`SELECT areacode AS areaname, regionname AS region, branchname AS branch FROM branches WHERE branchname 
                                            LIKE '%${req.body.data.baseBranch}%'`, (err, branch, fields) => {
                            if (!err) {
                                if (!branch.length == 0) {

                                    branchdbConnection.query(
                                        // `SELECT rm.fullname AS rm_fullname,rm.regionname AS rm_region, rm.email AS rm_email, am.fullname AS am_fullname,am.regionname AS am_region, am.email AS am_email 
                                        // FROM am_approvers am
                                        // INNER JOIN regional_approvers rm ON am.regionname = rm.regionname WHERE am.regionname 
                                        // LIKE '%${req.body.data.region}%' AND am.areaname LIKE '%${areacode[0].areaname}%'`,

                                        // `SELECT am.fullname AS am_fullname, am.email AS am_email, rm.fullname AS rm_fullname, 
                                        // rm.email AS rm_email, ram.fullname AS ram_fullname, ram.email AS ram_email, 
                                        // ass.fullname AS ass_fullname, ass.email AS ass_email, vpo.fullname AS vpo_fullname, 
                                        // vpo.email AS vpo_email FROM am_approvers am
                                        // INNER JOIN rm_approvers rm ON am.regionname = rm.regionname
                                        // INNER JOIN ram_approvers ram ON am.regionname = ram.regionname
                                        // INNER JOIN ass_vpo_approvers ass ON am.regionname = ass.regionname
                                        // INNER JOIN vpo_approver vpo ON am.regionname = vpo.regionname
                                        // WHERE am.regionname LIKE '%${req.body.data.region}%' AND am.areaname LIKE '%${areacode[0].areaname}%'`,

                                        `SELECT am.fullname AS am_fullname, am.email AS am_email, rm.fullname AS rm_fullname, 
                                        rm.email AS rm_email, ram.fullname AS ram_fullname, ram.email AS ram_email, 
                                        ass.fullname AS ass_fullname, ass.email AS ass_email, vpo.fullname AS vpo_fullname, 
                                        vpo.email AS vpo_email FROM am_approvers am
                                        INNER JOIN rm_approvers rm ON am.regionname = rm.regionname
                                        INNER JOIN ram_approvers ram ON am.regionname = ram.regionname
                                        INNER JOIN ass_vpo_approvers ass ON am.regionname = ass.regionname
                                        INNER JOIN vpo_approver vpo ON am.regionname = vpo.regionname
                                        WHERE am.regionname LIKE '%TEST%' AND am.areaname LIKE '%TEST%'`,
                                        (err, approvers, fields) => {
                                            if (!err) {
                                                if (!approvers.length == 0) {
                                                    branchdbConnection.query(query.postRfRequest,
                                                        [
                                                            req.body.data.type, req.body.data.rfDate, req.body.data.requestor, branch[0].branch, branch[0].region,
                                                            req.body.data.email, req.body.data.period, req.body.data.controlNo, req.body.data.rfAllowance, req.body.data.pendingRf,
                                                            req.body.data.totalExpenses, req.body.data.cashOnHand, req.body.data.transpo, req.body.data.supplies,
                                                            req.body.data.meals, req.body.data.others, req.body.data.total, req.body.data.purpose,
                                                            approvers[0].am_email, '', '', approvers[0].rm_email, '', '', approvers[0].ram_email, '', '', approvers[0].ass_email, '', '',
                                                            approvers[0].vpo_email, '', '', 'pending'
                                                        ],
                                                        (err, results, fields) => {
                                                            if (!err) {
                                                                branchdbConnection.query(query.getRfRequestByControlNo, (req.body.data.controlNo), (err, request, fields) => {
                                                                    if (!err) {
                                                                        if (!request.length == 0) {
                                                                            sendEmailRf(request[0]).then(response => {
                                                                                if (response.accepted) {
                                                                                    sendRfRequestor(request[0], request[0].am_fullname, request[0].rm_fullname).then(resp => {
                                                                                        if (resp.accepted) {
                                                                                            Logger.loggerInfo.addContext('context', 'requestController - post_RfRequest - Request Submitted Successfully');
                                                                                            Logger.loggerInfo.info(`sendRfRequestor - ${resp.messageId} - ${resp.accepted}`);
                                                                                            res.send({ message: 'Request submitted successfully' });
                                                                                        } else if (resp.rejected) {
                                                                                            Logger.loggerError.addContext('context', 'requestController - post_RfRequest - Network error');
                                                                                            Logger.loggerInfo.error(`sendRfRequestor - ${resp.messageId} - ${resp.rejected}`);
                                                                                            res.send({ message: 'Network Error' });
                                                                                        }
                                                                                    }).catch(err => {
                                                                                        Logger.loggerError.addContext('context', 'requestController - post_RfRequest - Network Error -');
                                                                                        Logger.loggerError.error(`sendRfRequestor ${err}`)
                                                                                        res.send({ message: "Network Error" });
                                                                                    })
                                                                                } else if (response.rejected) {
                                                                                    Logger.loggerError.addContext('context', 'requestController - post_RfRequest - Network Error -');
                                                                                    Logger.loggerError.error(`sendEmailRf - ${response.messageId} - ${response.rejected}`)
                                                                                    res.send({ message: 'Network Error' });
                                                                                }
                                                                            }).catch(err => {
                                                                                Logger.loggerError.addContext('context', 'requestController - post_RfRequest - Network Error -');
                                                                                Logger.loggerError.error(`sendEmailRf ${err}`)
                                                                                res.send({ message: "Network Error" });
                                                                            })

                                                                        } else {
                                                                            Logger.loggerError.addContext('context', 'requestController - post_RfRequest - getRfRequestByControlNo');
                                                                            Logger.loggerError.error(`No data found - ${request.length}`);
                                                                            res.status(404).send({ message: 'Failed to submit request' });
                                                                        }
                                                                    } else {
                                                                        Logger.loggerError.addContext('context', 'requestController - post_RfRequest - getRfRequestByControlNo');
                                                                        Logger.loggerError.error(`Something's wrong in the server - ${err}`);
                                                                        res.status(500).send({ message: "Something's wrong in the server" });
                                                                    }
                                                                })
                                                                // res.send(results);
                                                            } else {
                                                                Logger.loggerError.addContext('context', 'requestController - post_RfRequest - postRfRequest');
                                                                Logger.loggerError.error(`Something's wrong in the server - ${err}`);
                                                                res.status(500).send({ message: "Something's wrong in the server" });
                                                            }
                                                        })
                                                } else {
                                                    Logger.loggerError.addContext('context', 'requestController - post_RfRequest -');
                                                    Logger.loggerError.error(`No data found for approvers - approvers length: ${approvers.length}`);
                                                    res.status(404).send({ message: 'No data found for approvers' })
                                                }
                                            } else {
                                                Logger.loggerError.addContext('context', 'requestController - post_RfRequest -');
                                                Logger.loggerError.error(`Error retrieving approvers - ${err}`);
                                                res.status(500).send({ message: "Something's wrong in the server" })
                                            }
                                        })
                                } else {
                                    Logger.loggerError.addContext('context', 'requestController - post_RfRequest -');
                                    Logger.loggerError.error(`No areacode found  - areacode length: ${branch.length}`);
                                    res.status(404).send({ message: "No data found. Make sure that Base Branch and Region is correct." });
                                }

                            } else {
                                Logger.loggerError.addContext('context', 'requestController - post_RfRequest -');
                                Logger.loggerError.error(`Error retrieving areacode - ${err}`);
                                res.status(500).send({ message: "Something's wrong in the server" })
                            }

                        })
                    } catch (error) {
                        Logger.loggerFatal.addContext('context', 'requestContoller - post_RfRequest - ');
                        Logger.loggerFatal.fatal(`Something's wrong in the server - ${error}`);
                        res.status(500).send({ message: "Something's wrong in the server" })
                    }
                    break;
                case "Area Manager":
                    Logger.loggerInfo.addContext('context', 'requestController - post_RfRequest -');
                    Logger.loggerInfo.info(`Requestor Type: Area Manager`);
                    dbConnection.query(`SELECT areacode AS areaname, regionname AS region, branchname AS branch FROM branches WHERE branchname LIKE '%${req.body.data.baseBranch}%'`, (err, branch, fields) => {
                        if (!err) {
                            if (!branch.length == 0) {
                                branchdbConnection.query(
                                    // `SELECT rm.fullname AS rm_fullname,rm.regionname AS rm_region, rm.email AS rm_email, am.fullname AS am_fullname,am.regionname AS am_region, am.email AS am_email 
                                    // FROM am_approvers am
                                    // INNER JOIN regional_approvers rm ON am.regionname = rm.regionname WHERE am.regionname 
                                    // LIKE '%${req.body.data.region}%' AND am.areaname LIKE '%${areacode[0].areaname}%'`,

                                    // `SELECT am.fullname AS am_fullname, am.email AS am_email, rm.fullname AS rm_fullname, 
                                    // rm.email AS rm_email, ram.fullname AS ram_fullname, ram.email AS ram_email, 
                                    // ass.fullname AS ass_fullname, ass.email AS ass_email, vpo.fullname AS vpo_fullname, 
                                    // vpo.email AS vpo_email FROM am_approvers am
                                    // INNER JOIN rm_approvers rm ON am.regionname = rm.regionname
                                    // INNER JOIN ram_approvers ram ON am.regionname = ram.regionname
                                    // INNER JOIN ass_vpo_approvers ass ON am.regionname = ass.regionname
                                    // INNER JOIN vpo_approver vpo ON am.regionname = vpo.regionname
                                    // WHERE am.regionname LIKE '%${req.body.data.region}%' AND am.areaname LIKE '%${areacode[0].areaname}%'`,

                                    `SELECT rm.fullname AS rm_fullname, rm.email AS rm_email, ram.fullname AS ram_fullname, 
                                    ram.email AS ram_email, ass.fullname AS ass_fullname, ass.email AS ass_email, 
                                    vpo.fullname AS vpo_fullname, vpo.email AS vpo_email FROM rm_approvers rm
                                    INNER JOIN ram_approvers ram ON rm.regionname = ram.regionname
                                    INNER JOIN ass_vpo_approvers ass ON rm.regionname = ass.regionname
                                    INNER JOIN vpo_approver vpo ON rm.regionname = vpo.regionname
                                    WHERE rm.regionname LIKE '%TEST%'`,
                                    (err, approvers, fields) => {
                                        if (!err) {
                                            if (!approvers.length == 0) {
                                                branchdbConnection.query(query.postRfRequest,
                                                    [
                                                        req.body.data.type, req.body.data.rfDate, req.body.data.requestor, branch[0].branch, branch[0].branch,
                                                        req.body.data.email, req.body.data.period, req.body.data.controlNo, req.body.data.rfAllowance, req.body.data.pendingRf,
                                                        req.body.data.totalExpenses, req.body.data.cashOnHand, req.body.data.transpo, req.body.data.supplies,
                                                        req.body.data.meals, req.body.data.others, req.body.data.total, req.body.data.purpose,
                                                        null, null, null, approvers[0].rm_email, '', '', approvers[0].ram_email, '', '', approvers[0].ass_email, '', '',
                                                        approvers[0].vpo_email, '', '', 'pending'
                                                    ],
                                                    (err, results, fields) => {
                                                        if (!err) {
                                                            branchdbConnection.query(query.getRfRequestByControlNo, (req.body.data.controlNo), (err, request, fields) => {
                                                                if (!err) {
                                                                    if (!request.length == 0) {
                                                                        sendEmailRf(request[0]).then(response => {
                                                                            if (response.accepted) {
                                                                                sendRfRequestor(request[0], request[0].rm_fullname, request[0].ram_fullname).then(resp => {
                                                                                    if (resp.accepted) {
                                                                                        Logger.loggerInfo.addContext('context', 'requestController - post_RfRequest - Request Submitted Successfully');
                                                                                        Logger.loggerInfo.info(`sendRfRequestor - ${resp.messageId} - ${resp.accepted}`);
                                                                                        res.send({ message: 'Request submitted successfully' });
                                                                                    } else if (resp.rejected) {
                                                                                        Logger.loggerError.addContext('context', 'requestController - post_RfRequest - Network error');
                                                                                        Logger.loggerInfo.error(`sendRfRequestor - ${resp.messageId} - ${resp.rejected}`);
                                                                                        res.status(500).send({ message: 'Network Error' });
                                                                                    }
                                                                                }).catch(err => {
                                                                                    Logger.loggerError.addContext('context', 'requestController - post_RfRequest - Network Error -');
                                                                                    Logger.loggerError.error(`sendRfRequestor ${err}`)
                                                                                    res.status(500).send({ message: "Network Error" });
                                                                                })
                                                                            } else if (response.rejected) {
                                                                                Logger.loggerError.addContext('context', 'requestController - post_RfRequest - Network Error -');
                                                                                Logger.loggerError.error(`sendEmailRf - ${response.messageId} - ${response.rejected}`)
                                                                                res.status(500).send({ message: 'Network Error' });
                                                                            }
                                                                        }).catch(err => {
                                                                            Logger.loggerError.addContext('context', 'requestController - post_RfRequest - Network Error -');
                                                                            Logger.loggerError.error(`sendEmailRf ${err}`)
                                                                            res.status(500).send({ message: "Network Error" });
                                                                        })

                                                                    } else {
                                                                        Logger.loggerError.addContext('context', 'requestController - post_RfRequest - getRfRequestByControlNo');
                                                                        Logger.loggerError.error(`No data found - ${request.length}`);
                                                                        res.status(404).send({ message: 'Failed to submit request' });
                                                                    }
                                                                } else {
                                                                    Logger.loggerError.addContext('context', 'requestController - post_RfRequest - getRfRequestByControlNo');
                                                                    Logger.loggerError.error(`No data found - ${request.length}`);
                                                                    res.status(500).send({ message: "Something's wrong in the server" });
                                                                }
                                                            })
                                                        } else {
                                                            Logger.loggerError.addContext('context', 'requestController - post_RfRequest - getRfRequestByControlNo');
                                                            Logger.loggerError.error(`Something's wrong in the server - ${err}`);
                                                            res.status(500).send({ message: "Something's wrong in the server" });
                                                        }
                                                    })
                                            } else {
                                                Logger.loggerError.addContext('context', 'requestController - post_RfRequest -');
                                                Logger.loggerError.error(`No data found for approvers - approvers length: ${approvers.length}`);
                                                res.status(404).send({ message: 'No approvers found' })
                                            }
                                        } else {
                                            Logger.loggerError.addContext('context', 'requestController - post_RfRequest -');
                                            Logger.loggerError.error(`Error retrieving approvers - ${err}`);
                                            res.status(500).send({ message: "Something's wrong in the server" })
                                        }
                                    })
                            } else {
                                Logger.loggerError.addContext('context', 'requestController - post_RfRequest -');
                                Logger.loggerError.error(`No areacode found  - areacode length: ${branch.length}`);
                                res.status(404).send({ message: 'No data found. Make sure that Base Branch and Region is correct.' })
                            }
                        } else {
                            Logger.loggerError.addContext('context', 'requestController - post_RfRequest -');
                            Logger.loggerError.error(`Error retrieving areacode - ${err}`);
                            res.status(500).send({ message: "Something's wrong in the server" })
                        }
                    })

                    break;
                case "Regional Manager":
                    Logger.loggerInfo.addContext('context', 'requestController - post_RfRequest -');
                    Logger.loggerInfo.info(`Requestor Type: Regional Manager`);
                    dbConnection.query(`SELECT areacode AS areaname, regionname AS region, branchname AS branch FROM branches WHERE branchname 
                                        LIKE '%${req.body.data.baseBranch}%'`, (err, branch, fields) => {
                        if (!err) {
                            if (!branch.length == 0) {

                                branchdbConnection.query(
                                    // `SELECT rm.fullname AS rm_fullname,rm.regionname AS rm_region, rm.email AS rm_email, am.fullname AS am_fullname,am.regionname AS am_region, am.email AS am_email 
                                    // FROM am_approvers am
                                    // INNER JOIN regional_approvers rm ON am.regionname = rm.regionname WHERE am.regionname 
                                    // LIKE '%${req.body.data.region}%' AND am.areaname LIKE '%${areacode[0].areaname}%'`,

                                    // `SELECT am.fullname AS am_fullname, am.email AS am_email, rm.fullname AS rm_fullname, 
                                    // rm.email AS rm_email, ram.fullname AS ram_fullname, ram.email AS ram_email, 
                                    // ass.fullname AS ass_fullname, ass.email AS ass_email, vpo.fullname AS vpo_fullname, 
                                    // vpo.email AS vpo_email FROM am_approvers am
                                    // INNER JOIN rm_approvers rm ON am.regionname = rm.regionname
                                    // INNER JOIN ram_approvers ram ON am.regionname = ram.regionname
                                    // INNER JOIN ass_vpo_approvers ass ON am.regionname = ass.regionname
                                    // INNER JOIN vpo_approver vpo ON am.regionname = vpo.regionname
                                    // WHERE am.regionname LIKE '%${req.body.data.region}%' AND am.areaname LIKE '%${areacode[0].areaname}%'`,

                                    `SELECT ram.fullname AS ram_fullname, 
                                    ram.email AS ram_email, ass.fullname AS ass_fullname, ass.email AS ass_email, 
                                    vpo.fullname AS vpo_fullname, vpo.email AS vpo_email FROM ram_approvers ram
                                    INNER JOIN ass_vpo_approvers ass ON ram.regionname = ass.regionname
                                    INNER JOIN vpo_approver vpo ON ram.regionname = vpo.regionname
                                    WHERE ram.regionname LIKE '%TEST%'`,
                                    (err, approvers, fields) => {
                                        if (!err) {
                                            if (!approvers.length == 0) {
                                                branchdbConnection.query(query.postRfRequest,
                                                    [
                                                        req.body.data.type, req.body.data.rfDate, req.body.data.requestor, branch[0].branch, branch[0].region,
                                                        req.body.data.email, req.body.data.period, req.body.data.controlNo, req.body.data.rfAllowance, req.body.data.pendingRf,
                                                        req.body.data.totalExpenses, req.body.data.cashOnHand, req.body.data.transpo, req.body.data.supplies,
                                                        req.body.data.meals, req.body.data.others, req.body.data.total, req.body.data.purpose,
                                                        null, null, null, null, null, null, approvers[0].ram_email, '', '', approvers[0].ass_email, '', '',
                                                        approvers[0].vpo_email, '', '', 'pending'
                                                    ],
                                                    (err, results, fields) => {
                                                        if (!err) {
                                                            branchdbConnection.query(query.getRfRequestByControlNo, (req.body.data.controlNo), (err, request, fields) => {
                                                                if (!err) {
                                                                    if (!request.length == 0) {
                                                                        sendEmailRf(request[0]).then(response => {
                                                                            if (response.accepted) {
                                                                                sendRfRequestor(request[0], request[0].ram_fullname, request[0].ass_fullname).then(resp => {
                                                                                    if (resp.accepted) {
                                                                                        Logger.loggerInfo.addContext('context', 'requestController - post_RfRequest - Request Submitted Successfully');
                                                                                        Logger.loggerInfo.info(`sendRfRequestor - ${resp.messageId} - ${resp.accepted}`);
                                                                                        res.send({ message: "Request submitted successfully" });
                                                                                    } else if (resp.rejected) {
                                                                                        Logger.loggerError.addContext('context', 'requestController - post_RfRequest - Network error');
                                                                                        Logger.loggerInfo.error(`sendRfRequestor - ${resp.messageId} - ${resp.rejected}`);
                                                                                        res.status(500).send({ message: "Network Error" })
                                                                                    }
                                                                                }).catch(err => {
                                                                                    Logger.loggerError.addContext('context', 'requestController - post_RfRequest - Network Error -');
                                                                                    Logger.loggerError.error(`sendRfRequestor ${err}`)
                                                                                    res.status(500).send({ message: "Network Error" });
                                                                                })
                                                                            } else if (response.rejected) {
                                                                                Logger.loggerError.addContext('context', 'requestController - post_RfRequest - Network Error -');
                                                                                Logger.loggerError.error(`sendEmailRf - ${response.messageId} - ${response.rejected}`)
                                                                                res.status(500).send({ message: 'Network Error' });
                                                                            }
                                                                        }).catch(err => {
                                                                            Logger.loggerError.addContext('context', 'requestController - post_RfRequest - Network Error -');
                                                                            Logger.loggerError.error(`sendEmailRf ${err}`)
                                                                            res.status(500).send({ message: 'Network Error' });
                                                                        })

                                                                    } else {
                                                                        Logger.loggerError.addContext('context', 'requestController - post_RfRequest - getRfRequestByControlNo');
                                                                        Logger.loggerError.error(`No data found - ${request.length}`);
                                                                        res.status(404).send({ message: 'Failed to submit request' });
                                                                    }
                                                                } else {
                                                                    Logger.loggerError.addContext('context', 'requestController - post_RfRequest - getRfRequestByControlNo');
                                                                    Logger.loggerError.error(`Something's wrong in the server - ${err}`);
                                                                    res.status(500).send({ message: "Something's wrong in the server" });
                                                                }
                                                            })
                                                        } else {
                                                            Logger.loggerError.addContext('context', 'requestController - post_RfRequest - postRfRequest');
                                                            Logger.loggerError.error(`Something's wrong in the server - ${err}`);
                                                            res.status(500).send({ message: "Something's wrong in the server" });
                                                        }
                                                    })
                                            } else {
                                                Logger.loggerError.addContext('context', 'requestController - post_RfRequest -');
                                                Logger.loggerError.error(`No data found for approvers - approvers length: ${approvers.length}`);
                                                res.status(404).send({ message: 'No approvers found' });
                                            }
                                        } else {
                                            Logger.loggerError.addContext('context', 'requestController - post_RfRequest -');
                                            Logger.loggerError.error(`Error retrieving approvers - ${err}`);
                                            res.status(500).send({ message: "Something's wrong in the server" });
                                        }
                                    })
                            } else {
                                Logger.loggerError.addContext('context', 'requestController - post_RfRequest -');
                                Logger.loggerError.error(`No areacode found  - areacode length: ${branch.length}`);
                                res.status(404).send({ message: "No data found. Make sure that Base Branch and Region is correct." });
                            }
                        } else {
                            Logger.loggerError.addContext('context', 'requestController - post_RfRequest -');
                            Logger.loggerError.error(`Error retrieving areacode - ${err}`);
                            res.status(500).send({ message: "Something's wrong in the server" })
                        }
                    })
                    break;

                case "Regional Area Manager":
                    Logger.loggerInfo.addContext('context', 'requestController - post_RfRequest -');
                    Logger.loggerInfo.info(`Requestor Type: Regional Area Manager`);
                    dbConnection.query(`SELECT areacode AS areaname, regionname AS region, branchname AS branch FROM branches WHERE branchname 
                                        LIKE '%${req.body.data.baseBranch}%'`, (err, branch, fields) => {
                        if (!err) {
                            if (!branch.length == 0) {
                                branchdbConnection.query(
                                    // `SELECT rm.fullname AS rm_fullname,rm.regionname AS rm_region, rm.email AS rm_email, am.fullname AS am_fullname,am.regionname AS am_region, am.email AS am_email 
                                    // FROM am_approvers am
                                    // INNER JOIN regional_approvers rm ON am.regionname = rm.regionname WHERE am.regionname 
                                    // LIKE '%${req.body.data.region}%' AND am.areaname LIKE '%${areacode[0].areaname}%'`,

                                    // `SELECT am.fullname AS am_fullname, am.email AS am_email, rm.fullname AS rm_fullname, 
                                    // rm.email AS rm_email, ram.fullname AS ram_fullname, ram.email AS ram_email, 
                                    // ass.fullname AS ass_fullname, ass.email AS ass_email, vpo.fullname AS vpo_fullname, 
                                    // vpo.email AS vpo_email FROM am_approvers am
                                    // INNER JOIN rm_approvers rm ON am.regionname = rm.regionname
                                    // INNER JOIN ram_approvers ram ON am.regionname = ram.regionname
                                    // INNER JOIN ass_vpo_approvers ass ON am.regionname = ass.regionname
                                    // INNER JOIN vpo_approver vpo ON am.regionname = vpo.regionname
                                    // WHERE am.regionname LIKE '%${req.body.data.region}%' AND am.areaname LIKE '%${areacode[0].areaname}%'`,

                                    `SELECT ass.fullname AS ass_fullname, ass.email AS ass_email, 
                                    vpo.fullname AS vpo_fullname, vpo.email AS vpo_email FROM ass_vpo_approvers ass
                                    INNER JOIN vpo_approver vpo ON ass.regionname = vpo.regionname
                                    WHERE ass.regionname LIKE '%TEST%'`,
                                    (err, approvers, fields) => {
                                        if (!err) {
                                            if (!approvers.length == 0) {
                                                branchdbConnection.query(query.postRfRequest,
                                                    [
                                                        req.body.data.type, req.body.data.rfDate, req.body.data.requestor, branch[0].branch, branch[0].region, req.body.data.email,
                                                        req.body.data.period, req.body.data.controlNo, req.body.data.rfAllowance, req.body.data.pendingRf,
                                                        req.body.data.totalExpenses, req.body.data.cashOnHand, req.body.data.transpo, req.body.data.supplies,
                                                        req.body.data.meals, req.body.data.others, req.body.data.total, req.body.data.purpose,
                                                        null, null, null, null, null, null, null, null, null, approvers[0].ass_email, '', '',
                                                        approvers[0].vpo_email, '', '', 'pending'
                                                    ],
                                                    (err, results, fields) => {
                                                        if (!err) {
                                                            branchdbConnection.query(query.getRfRequestByControlNo, (req.body.data.controlNo), (err, request, fields) => {
                                                                if (!err) {
                                                                    if (!request.length == 0) {
                                                                        sendEmailRf(request[0]).then(response => {
                                                                            if (response.accepted) {
                                                                                sendRfRequestor(request[0], request[0].ass_fullname, request[0].vpo_fullname).then(resp => {
                                                                                    if (resp.accepted) {
                                                                                        Logger.loggerInfo.addContext('context', 'requestController - post_RfRequest - Request Submitted Successfully');
                                                                                        Logger.loggerInfo.info(`sendRfRequestor - ${resp.messageId} - ${resp.accepted}`);
                                                                                        res.send({ message: "Request submitted successfully" });
                                                                                    } else if (resp.rejected) {
                                                                                        Logger.loggerError.addContext('context', 'requestController - post_RfRequest - Network error');
                                                                                        Logger.loggerInfo.error(`sendRfRequestor - ${resp.messageId} - ${resp.rejected}`);
                                                                                        res.status(500).send({ message: "Network Error" });
                                                                                    }
                                                                                }).catch(err => {
                                                                                    Logger.loggerError.addContext('context', 'requestController - post_RfRequest - Network Error -');
                                                                                    Logger.loggerError.error(`sendRfRequestor ${err}`);
                                                                                    res.status(500).send({ message: "Network Error" });
                                                                                })
                                                                            } else if (response.rejected) {
                                                                                Logger.loggerError.addContext('context', 'requestController - post_RfRequest - Network Error -');
                                                                                Logger.loggerError.error(`sendEmailRf - ${response.messageId} - ${response.rejected}`)
                                                                                res.status(500).send({ message: 'Network Error' });
                                                                            }
                                                                        }).catch(err => {
                                                                            Logger.loggerError.addContext('context', 'requestController - post_RfRequest - Network Error -');
                                                                            Logger.loggerError.error(`sendEmailRf ${err}`)
                                                                            res.status(500).send({ message: 'Network Error' });
                                                                        })

                                                                    } else {
                                                                        Logger.loggerError.addContext('context', 'requestController - post_RfRequest - getRfRequestByControlNo');
                                                                        Logger.loggerError.error(`No data found - ${request.length}`);
                                                                        res.status(404).send({ message: 'Failed to submit request' });
                                                                    }
                                                                } else {
                                                                    Logger.loggerError.addContext('context', 'requestController - post_RfRequest - getRfRequestByControlNo');
                                                                    Logger.loggerError.error(`Something's wrong in the server - ${err}`);
                                                                    res.status(500).send({ message: "Something's wrong in the server" });
                                                                }
                                                            })
                                                        } else {
                                                            Logger.loggerError.addContext('context', 'requestController - post_RfRequest - postRfRequest');
                                                            Logger.loggerError.error(`Something's wrong in the server - ${err}`);
                                                            res.status(500).send({ message: "Something's wrong in the server" });
                                                        }
                                                    })
                                            } else {
                                                Logger.loggerError.addContext('context', 'requestController - post_RfRequest -');
                                                Logger.loggerError.error(`No data found for approvers - approvers length: ${approvers.length}`);
                                                res.status(404).send({ message: 'No approvers found' })
                                            }
                                        } else {
                                            Logger.loggerError.addContext('context', 'requestController - post_RfRequest -');
                                            Logger.loggerError.error(`Error retrieving approvers - ${err}`);
                                            res.status(500).send({ message: "Something's wrong in the server" });
                                        }
                                    })
                            } else {
                                Logger.loggerError.addContext('context', 'requestController - post_RfRequest -');
                                Logger.loggerError.error(`No areacode found  - areacode length: ${branch.length}`);
                                res.status(404).send({ message: "No data found. Make sure that Base Branch and Region is correct." });
                            }
                        } else {
                            Logger.loggerError.addContext('context', 'requestController - post_RfRequest -');
                            Logger.loggerError.error(`Error retrieving areacode - ${err}`);
                            res.status(500).send({ message: "Something's wrong in the server" })
                        }
                    })
                    break;
                case "Asst. to Vpo | Coo":
                    Logger.loggerInfo.addContext('context', 'requestController - post_RfRequest -');
                    Logger.loggerInfo.info(`Requestor Type: Asst. to Vpo | Coo`);
                    dbConnection.query(`SELECT areacode AS areaname, regionname AS region, branchname AS branch FROM branches WHERE branchname 
                                        LIKE '%${req.body.data.baseBranch}%'`, (err, branch, fields) => {
                        if (!err) {
                            if (!branch.length == 0) {
                                branchdbConnection.query(
                                    // `SELECT rm.fullname AS rm_fullname,rm.regionname AS rm_region, rm.email AS rm_email, am.fullname AS am_fullname,am.regionname AS am_region, am.email AS am_email 
                                    // FROM am_approvers am
                                    // INNER JOIN regional_approvers rm ON am.regionname = rm.regionname WHERE am.regionname 
                                    // LIKE '%${req.body.data.region}%' AND am.areaname LIKE '%${areacode[0].areaname}%'`,

                                    // `SELECT am.fullname AS am_fullname, am.email AS am_email, rm.fullname AS rm_fullname, 
                                    // rm.email AS rm_email, ram.fullname AS ram_fullname, ram.email AS ram_email, 
                                    // ass.fullname AS ass_fullname, ass.email AS ass_email, vpo.fullname AS vpo_fullname, 
                                    // vpo.email AS vpo_email FROM am_approvers am
                                    // INNER JOIN rm_approvers rm ON am.regionname = rm.regionname
                                    // INNER JOIN ram_approvers ram ON am.regionname = ram.regionname
                                    // INNER JOIN ass_vpo_approvers ass ON am.regionname = ass.regionname
                                    // INNER JOIN vpo_approver vpo ON am.regionname = vpo.regionname
                                    // WHERE am.regionname LIKE '%${req.body.data.region}%' AND am.areaname LIKE '%${areacode[0].areaname}%'`,

                                    `SELECT vpo.fullname AS vpo_fullname, vpo.email AS vpo_email 
                                    FROM vpo_approver vpo WHERE vpo.regionname LIKE '%TEST%'`,
                                    (err, approvers, fields) => {
                                        if (!err) {
                                            if (!approvers.length == 0) {
                                                branchdbConnection.query(query.postRfRequest,
                                                    [
                                                        req.body.data.type, req.body.data.rfDate, req.body.data.requestor, branch[0].branch, branch[0].region,
                                                        req.body.data.email, req.body.data.period, req.body.data.controlNo, req.body.data.rfAllowance, req.body.data.pendingRf,
                                                        req.body.data.totalExpenses, req.body.data.cashOnHand, req.body.data.transpo, req.body.data.supplies,
                                                        req.body.data.meals, req.body.data.others, req.body.data.total, req.body.data.purpose,
                                                        null, null,null, null, null,null, null, null,null, approvers[0].ass_email, '','',
                                                        approvers[0].vpo_email, '','', 'pending'
                                                    ],
                                                    (err, results, fields) => {
                                                        if (!err) {
                                                            branchdbConnection.query(query.getRfRequestByControlNo, (req.body.data.controlNo), (err, request, fields) => {
                                                                if (!err) {
                                                                    if (!request.length == 0) {
                                                                        sendEmailRf(request[0]).then(response => {
                                                                            if (response.accepted) {
                                                                                sendRfRequestor(request[0], request[0].vpo_fullname, '').then(resp => {
                                                                                    if (resp.accepted) {
                                                                                        Logger.loggerInfo.addContext('context', 'requestController - post_RfRequest - Request Submitted Successfully');
                                                                                        Logger.loggerInfo.info(`sendRfRequestor - ${resp.messageId} - ${resp.accepted}`);
                                                                                        res.send({ message: "Request submitted successfully" })
                                                                                    } else if (resp.rejected) {
                                                                                        Logger.loggerError.addContext('context', 'requestController - post_RfRequest - Network error');
                                                                                        Logger.loggerInfo.error(`sendRfRequestor - ${resp.messageId} - ${resp.rejected}`);
                                                                                        res.status(500).send({ message: "Network Error" });
                                                                                    }
                                                                                }).catch(err => {
                                                                                    Logger.loggerError.addContext('context', 'requestController - post_RfRequest - Network Error -');
                                                                                    Logger.loggerError.error(`sendRfRequestor ${err}`);
                                                                                    res.status(500).send({ message: "Network Error" });
                                                                                })
                                                                            } else if (response.rejected) {
                                                                                Logger.loggerError.addContext('context', 'requestController - post_RfRequest - Network Error -');
                                                                                Logger.loggerError.error(`sendEmailRf - ${response.messageId} - ${response.rejected}`)
                                                                                res.status(500).send({ message: 'Network Error' });
                                                                            }
                                                                        }).catch(err => {
                                                                            Logger.loggerError.addContext('context', 'requestController - post_RfRequest - Network Error -');
                                                                            Logger.loggerError.error(`sendEmailRf ${err}`)
                                                                            res.status(500).send({ message: "Network Error" });
                                                                        })

                                                                    } else {
                                                                        Logger.loggerError.addContext('context', 'requestController - post_RfRequest - getRfRequestByControlNo');
                                                                        Logger.loggerError.error(`No data found - ${request.length}`);
                                                                        res.status(404).send({ message: 'Failed to submit request' });
                                                                    }
                                                                } else {
                                                                    Logger.loggerError.addContext('context', 'requestController - post_RfRequest - getRfRequestByControlNo');
                                                                    Logger.loggerError.error(`Something's wrong in the server - ${err}`);
                                                                    res.status(500).send({ message: "Something's wrong in the server" });
                                                                }
                                                            })
                                                        } else {
                                                            Logger.loggerError.addContext('context', 'requestController - post_RfRequest - postRfRequest');
                                                            Logger.loggerError.error(`Something's wrong in the server - ${err}`);
                                                            res.status(500).send({ message: "Something's wrong in the server" });
                                                        }
                                                    })
                                            } else {
                                                Logger.loggerError.addContext('context', 'requestController - post_RfRequest -');
                                                Logger.loggerError.error(`No data found for approvers - approvers length: ${approvers.length}`);
                                                res.status(404).send({ message: 'No approvers found' });
                                            }
                                        } else {
                                            Logger.loggerError.addContext('context', 'requestController - post_RfRequest -');
                                            Logger.loggerError.error(`Error retrieving approvers - ${err}`);
                                            res.send({ message: "Something's wrong in the server" });
                                        }
                                    })
                            } else {
                                Logger.loggerError.addContext('context', 'requestController - post_RfRequest -');
                                Logger.loggerError.error(`No areacode found  - areacode length: ${branch.length}`);
                                res.status(404).send({ message: "No data found. Make sure that Base Branch and Region is correct." });
                            }
                        } else {
                            Logger.loggerError.addContext('context', 'requestController - post_RfRequest -');
                            Logger.loggerError.error(`Error retrieving areacode - ${err}`);
                            res.status(500).send({ message: "Something's wrong in the server" })
                        }
                    })
                    break;
                case "Vpo":
                    Logger.loggerInfo.addContext('context', 'requestController - post_RfRequest -');
                    Logger.loggerInfo.info(`Requestor Type: Vpo | Coo`);
                    branchdbConnection.query(query.postRfRequest,
                        [
                            req.body.data.type, req.body.data.rfDate, req.body.data.requestor, req.body.data.baseBranch, req.body.data.region,
                            req.body.data.email, req.body.data.period, req.body.data.controlNo, req.body.data.rfAllowance, req.body.data.pendingRf,
                            req.body.data.totalExpenses, req.body.data.cashOnHand, req.body.data.transpo, req.body.data.supplies,
                            req.body.data.meals, req.body.data.others, req.body.data.total, req.body.data.purpose,
                            null, null, null, null, null, null, null, null,null,null,null,null,null,
                            null, null, 'approved'
                        ], (err, result, fields) => {
                            if (!err) {
                                branchdbConnection.query(query.getRfRequestByControlNo, (req.body.data.controlNo), (err, request, field) => {
                                    if (!err) {
                                        if (!request.length == 0) {
                                            let approvedTemplate = fs.readFileSync(path.join(__dirname, '..', 'views', 'templates', 'rfApproved_pdf.hbs'), 'utf-8');

                                            let context = {
                                                data: request[0],
                                                isNotVpo: false
                                            }
                                            let template = handlebars.compile(approvedTemplate);

                                            let DOC = template(context);

                                            _createPdfStream(DOC).then((stream) => {
                                                _streamToBuffer(stream, function (err, buffer) {
                                                    if (err) {
                                                        Logger.loggerError.addContext('context', 'requestController - post_RfRequest -');
                                                        Logger.loggerError.error(`Error generating PDF ${err}`);
                                                        throw new Error(err);
                                                    }
                                                    sendEmail({
                                                        subject: `Revolving Fund ${request[0].controlNo} REQUEST APPROVED`,
                                                        to: request[0].email,
                                                        from: "'Cash Request <cashrequest@mlhuillier.com>'",
                                                        template: "rfApproved",
                                                        context: {
                                                            data: request[0],
                                                        },
                                                        attachments: [{
                                                            filename: `REVOLVING FUND LIQUIDATION ${request[0].controlNo}.pdf`,
                                                            content: buffer,
                                                            contentDisposition: 'application/pdf'
                                                        }]
                                                    });
                                                });
                                            });
                                            Logger.loggerInfo.addContext('context', 'requestController - post_RfRequest - Request Submitted Successfully');
                                            Logger.loggerInfo.info(`generate PDF - success`);
                                            res.send({ message: 'Request Submitted Successfully' })
                                        } else {
                                            Logger.loggerError.addContext('context', 'requestController - post_RfRequest - getRfRequestByControlNo');
                                            Logger.loggerError.error(`No data found - ${request.length}`);
                                            res.status(404).send({ message: 'Failed to submit request' });
                                        }
                                    } else {
                                        Logger.loggerError.addContext('context', 'requestController - post_RfRequest - getRfRequestByControlNo');
                                        Logger.loggerError.error(`Something's wrong in the server - ${err}`);
                                        res.status(500).send({ message: "Something's wrong in the server" });
                                    }
                                })
                            } else {
                                Logger.loggerError.addContext('context', 'requestController - post_RfRequest - postRfRequest');
                                Logger.loggerError.error(`Failed to submit request - ${err}`);
                                res.status(500).send({ message: "Failed to submit request" });
                            }
                        })
                    break;
                default:
                    break;
            }

        } catch (error) {
            Logger.loggerFatal.addContext('context', 'requestController - post_RfRequest');
            Logger.loggerFatal.fatal(`Method Error ${error}`);
            res.status(500).send({ message: "Something's wrong in the server. Please refresh the page and try again." });
        }
    },
}