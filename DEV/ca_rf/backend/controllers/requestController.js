const branchdbConnection = require('../config/branchDBConnection');
const dbConnection = require('../config/dbConnection');
const kpdbConnection = require('../config/dbConnection');
const query = require('../config/queries');
const logger = require('../logs/logger');
const { sendEmailRf, sendRfRequestor } = require('./mailController');
const mailController = require('./mailController');

module.exports = {
    getMaxId(req, res) {
        try {
            branchdbConnection.query(query.getMaxId, (err, row, fields) => {
                if (!err) {
                    if (!row.length == 0) {
                        console.log('ID', row);
                        res.send(row[0])
                    } else {
                        console.log("No id found");
                        res.send({ id: 0 })
                    }
                } else {
                    console.log("ERR", err);
                    res.send({ message: "Error ID retrieval." })
                }
            })
        } catch (error) {
            console.log("ERROR", error);
            res.send({ message: "Error ID retrieval." })
        }
    },
    getRfMaxId(req, res) {
        try {
            branchdbConnection.query(query.getRfMaxId, (err, row, fields) => {
                if (!err) {
                    if (!row.length == 0) {
                        console.log('ID', row);
                        res.send(row[0])
                    } else {
                        console.log("No id found");
                        res.send({ id: 0 })
                    }
                } else {
                    console.log("ERR", err);
                    res.send({ message: "Error ID retrieval." })
                }
            })
        } catch (error) {
            console.log("ERROR", error);
            res.send({ message: "Error ID retrieval." })
        }
    },
    postRequest(req, res) {
        console.log('DATA', req.body);

        try {
            let area = (req.body.data.area).substr(15);
            let region = (req.body.data.region).substr(4);
            branchdbConnection.query(
                // `SELECT am.fullname AS am_fullname, am.email AS am_email, rm.fullname AS rm_fullname, rm.email AS rm_email, ram.fullname AS ram_fullname, 
                // ram.email AS ram_email, ass.fullname AS ass_fullname, ass.email AS ass_email, vpo.fullname AS vpo_fullname, vpo.email AS vpo_email FROM am_approvers am
                // INNER JOIN rm_approvers rm ON am.regionname = rm.regionname
                // INNER JOIN ram_approvers ram ON am.regionname = ram.regionname
                // INNER JOIN ass_vpo_approvers ass ON am.regionname = ass.regionname
                // INNER JOIN vpo_approver vpo ON am.regionname = vpo.regionname
                // WHERE am.regionname LIKE '%${region}%' AND am.areaname LIKE '%${area}%'`,
                `SELECT am.fullname AS am_fullname, am.email AS am_email, rm.fullname AS rm_fullname, rm.email AS rm_email, ram.fullname AS ram_fullname, 
                ram.email AS ram_email, ass.fullname AS ass_fullname, ass.email AS ass_email, vpo.fullname AS vpo_fullname, vpo.email AS vpo_email FROM am_approvers am
                INNER JOIN rm_approvers rm ON am.regionname = rm.regionname
                INNER JOIN ram_approvers ram ON am.regionname = ram.regionname
                INNER JOIN ass_vpo_approvers ass ON am.regionname = ass.regionname
                INNER JOIN vpo_approver vpo ON am.regionname = vpo.regionname
                WHERE am.regionname LIKE '%TEST%' AND am.areaname LIKE '%TEST%'`,
                (err, approverRows, fields) => {
                    if (!err) {
                        console.log(approverRows);
                        if (!approverRows.length == 0) {
                            try {
                                branchdbConnection.query(query.postRequest,
                                    [
                                        req.body.data.idNumber, req.body.data.author, req.body.data.jobTitle,
                                        req.body.data.branch, req.body.data.area, req.body.data.region, req.body.data.email, req.body.data.purpose,
                                        req.body.data.controlNo, req.body.data.date, req.body.data.travelDate, req.body.data.departureDate,
                                        req.body.data.arrivalDate, req.body.data.amount, approverRows[0].am_email, '', approverRows[0].rm_email, '',
                                        approverRows[0].ram_email, '', approverRows[0].ass_email, '', approverRows[0].vpo_email, '', 'pending'
                                    ], (err, fields) => {
                                        if (!err) {
                                            try {
                                                branchdbConnection.query(query.getRequestByControlNo, (req.body.data.controlNo), (err, request_rows, fields) => {
                                                    if (!err) {
                                                        if (!request_rows.length == 0) {
                                                            console.log(request_rows);
                                                            mailController.sendMail(request_rows).then(response => {
                                                                console.log(response);
                                                                if (response.accepted) {
                                                                    mailController.sendEmailNotificationRequestor(request_rows).then(resp => {
                                                                        if (resp.accepted) {
                                                                            res.send({ message: 'Request submitted successfully' })
                                                                        } else if (resp.rejected) {
                                                                            console.log(err);
                                                                            res.send({ message: 'Network error' })
                                                                        }
                                                                    }).catch(err => {
                                                                        console.log(err);
                                                                        res.send({ message: 'Network error' })
                                                                    })
                                                                }
                                                                else if (response.rejected) {
                                                                    res.status(400).send({ message: 'Failed to submit request' })
                                                                }
                                                            }).catch(err => {
                                                                console.log(err);
                                                                res.send({ message: 'Network error' })
                                                            })
                                                        } else {
                                                            res.status(400).send({ message: 'Failed to submit request' })
                                                        }
                                                    } else {
                                                        res.status(404).send({ message: 'Failed to submit request' })
                                                        console.log('ERR REQUEST_BY_CONTROLID', err);
                                                    }
                                                })
                                            } catch (error) {
                                                console.log(error);
                                            }
                                        }
                                        else {
                                            console.log('Failed to submit request', err);
                                            res.status(400).send({ message: 'Failed to submit request' })
                                        }
                                    })
                            } catch (error) {
                                console.log(error);
                            }

                        } else {
                            res.status(404).send({ message: 'Failed to submit request' })
                        }

                    } else {
                        console.log(err);
                    }
                })

        } catch (error) {
            console.log('ERROR', error);
            res.status(500).send({ message: "Something's wrong in the server. Please refresh the page and try again." });

        }

    },
    post_RfRequest(req, res) {
        // console.log(req.body);

        try {

            switch (req.body.data.type) {
                case "Branch Manager":
                    try {
                        dbConnection.query(`SELECT areacode AS areaname FROM branches WHERE branchname LIKE '%${req.body.data.baseBranch}%'`, (err, areacode, fields) => {
                            if (!err) {
                                if (!areacode.length == 0) {
                                    console.log('areacode',areacode);
                                    // console.log(areacode[0].areaname);
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
                                                    console.log(approvers[0]);
                                                    branchdbConnection.query(query.postRfRequest,
                                                        [
                                                            req.body.data.type, req.body.data.rfDate, req.body.data.requestor, req.body.data.baseBranch, req.body.data.region,
                                                            req.body.data.email, req.body.data.period, req.body.data.controlNo, req.body.data.rfAllowance, req.body.data.pendingRf,
                                                            req.body.data.totalExpenses, req.body.data.cashOnHand, req.body.data.transpo, req.body.data.supplies,
                                                            req.body.data.meals, req.body.data.others, req.body.data.total, req.body.data.purpose,
                                                            approvers[0].am_email, '', approvers[0].rm_email, '', approvers[0].ram_email, '', approvers[0].ass_email, '',
                                                            approvers[0].vpo_email, '', 'pending'
                                                        ],
                                                        (err, results, fields) => {
                                                            if (!err) {
                                                                branchdbConnection.query(query.getRfRequestByControlNo, (req.body.data.controlNo), (err, request, fields) =>{
                                                                    if (!err) {
                                                                        if (!request.length == 0) {
                                                                            console.log(request[0]);
                                                                            sendEmailRf(request[0]).then(response => {
                                                                                if (response.accepted) {
                                                                                    sendRfRequestor(request[0], request[0].am_fullname, request[0].rm_fullname).then(resp =>{
                                                                                        if (resp.accepted) {
                                                                                            res.send({message:'Request submitted successfully'});
                                                                                        } else if (resp.rejected) {
                                                                                            res.send({message:'Network Error'});
                                                                                        }
                                                                                        
                                                                                    }).catch(err => {
                                                                                        console.log(err);
                                                                                        res.send({message:"Network Error"});
                                                                                    })
                                                                                } else if (response.rejected) {
                                                                                    res.send({message: 'Network Error'});
                                                                                }
                                                                            }).catch(err => {
                                                                                console.log(err);
                                                                                res.send({message:"Network Error"});
                                                                            })
                                                                            
                                                                        } else {
                                                                            console.log(request.length);
                                                                            res.status(404).send({message:'Failed to submit request'});
                                                                        }
                                                                    } else {
                                                                        console.log(err);
                                                                        res.status(500).send({message:"Something's wrong in the server"});
                                                                    }
                                                                })
                                                                // res.send(results);
                                                            } else {
                                                                console.log(err);
                                                                res.status(500).send({message:"Something's wrong in the server"});
                                                            }
                                                        })
                                                } else {
                                                    console.log(approvers.length);
                                                    res.status(404).send({message:'No data found for approvers'})
                                                }
                                            } else {
                                                console.log(err);
                                                res.status(500).send({message:"Something's wrong in the server"})
                                            }
                                        })
                                } else {
                                    console.log(areacode[0]);
                                    res.status(404).send({message:"No data found. Make sure that Base Branch and Region is correct."});
                                }

                            } else {
                                console.log(err);
                                res.status(500).send({message:"Something's wrong in the server"})
                            }

                        })
                    } catch (error) {
                        console.log(error);
                        res.status(500).send({message:"Something's wrong in the server"})
                    }
                    break;
                case "Area Manager":
                    dbConnection.query(`SELECT areacode AS areaname FROM branches WHERE branchname LIKE '%${req.body.data.baseBranch}%'`, (err, areacode, fields) => {
                        if (!err) {
                            if (!areacode.length == 0) {
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
                                                        req.body.data.type, req.body.data.rfDate, req.body.data.requestor, req.body.data.baseBranch, req.body.data.region,
                                                        req.body.data.email, req.body.data.period, req.body.data.controlNo, req.body.data.rfAllowance, req.body.data.pendingRf,
                                                        req.body.data.totalExpenses, req.body.data.cashOnHand, req.body.data.transpo, req.body.data.supplies,
                                                        req.body.data.meals, req.body.data.others, req.body.data.total, req.body.data.purpose,
                                                        null, null, approvers[0].rm_email, '', approvers[0].ram_email, '', approvers[0].ass_email, '',
                                                        approvers[0].vpo_email, '', 'pending'
                                                    ],
                                                    (err, results, fields) => {
                                                        if (!err) {
                                                            branchdbConnection.query(query.getRfRequestByControlNo, (req.body.data.controlNo), (err, request, fields) =>{
                                                                if (!err) {
                                                                    if (!request.length == 0) {
                                                                        sendEmailRf(request[0]).then(response => {
                                                                            if (response.accepted) {
                                                                                sendRfRequestor(request[0], request[0].rm_fullname, request[0].ram_fullname).then(resp =>{
                                                                                    if (resp.accepted) {
                                                                                        res.send({message:'Request submitted successfully'});
                                                                                    } else if (resp.rejected) {
                                                                                        res.status(500).send({message:'Network Error'});
                                                                                    }
                                                                                }).catch(err => {
                                                                                    console.log(err);
                                                                                    res.status(500).send({message:"Network Error"});
                                                                                })
                                                                            } else if (response.rejected) {
                                                                                res.status(500).send({message: 'Network Error'});
                                                                            }
                                                                        }).catch(err => {
                                                                            console.log(err);
                                                                            res.status(500).send({message:"Network Error"});
                                                                        })
                                                                        
                                                                    } else {
                                                                        console.log(request.length);
                                                                        res.status(404).send({message:'Failed to submit request'});
                                                                    }
                                                                } else {
                                                                    console.log(err);
                                                                    res.status(500).send({message:"Something's wrong in the server"});
                                                                }
                                                            })
                                                        } else {
                                                            console.log(err);
                                                            res.status(500).send({message:"Something's wrong in the server"});
                                                        }
                                                    })
                                            } else {
                                                res.status(404).send({ message: 'No approvers found' })
                                            }
                                        } else {
                                            res.status(500).send({message:"Something's wrong in the server"})
                                        }
                                    })
                            } else {
                                res.status(404).send({ message: 'No data found. Make sure that Base Branch and Region is correct.' })
                            }
                        } else {
                            res.status(500).send({message:"Something's wrong in the server"})
                        }
                    })

                    break;
                case "Regional Manager":
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
                                            req.body.data.type, req.body.data.rfDate, req.body.data.requestor, req.body.data.baseBranch, req.body.data.region,
                                            req.body.data.email, req.body.data.period, req.body.data.controlNo, req.body.data.rfAllowance, req.body.data.pendingRf,
                                            req.body.data.totalExpenses, req.body.data.cashOnHand, req.body.data.transpo, req.body.data.supplies,
                                            req.body.data.meals, req.body.data.others, req.body.data.total, req.body.data.purpose,
                                            null, null, null, null, approvers[0].ram_email, '', approvers[0].ass_email, '',
                                            approvers[0].vpo_email, '', 'pending'
                                        ],
                                        (err, results, fields) => {
                                            if (!err) {
                                                branchdbConnection.query(query.getRfRequestByControlNo, (req.body.data.controlNo), (err, request, fields) =>{
                                                    if (!err) {
                                                        if (!request.length == 0) {
                                                            console.log(request[0]);
                                                            sendEmailRf(request[0]).then(response => {
                                                                if (response.accepted) {
                                                                    sendRfRequestor(request[0], request[0].ram_fullname, request[0].ass_fullname).then(resp =>{
                                                                        if (resp.accepted) {
                                                                            res.send({message:"Request submitted successfully"});
                                                                        } else if (resp.rejected) {
                                                                            res.status(500).send({message:"Network Error"})
                                                                        }
                                                                    }).catch(err => {
                                                                        console.log(err);
                                                                        res.status(500).send({message:"Network Error"});
                                                                    })
                                                                } else if (response.rejected) {
                                                                    res.status(500).send({message: 'Network Error'});
                                                                }
                                                            }).catch(err => {
                                                                console.log(err);
                                                                res.status(500).send({message: 'Network Error'});
                                                            })
                                                            
                                                        } else {
                                                            res.status(404).send({message:'Failed to submit request'});
                                                            console.log(request.length);
                                                        }
                                                    } else {
                                                        res.status(500).send({message:"Something's wrong in the server"});
                                                    }
                                                })
                                            } else {
                                                res.status(500).send({message:"Something's wrong in the server"});
                                            }
                                        })
                                } else {
                                    res.status(404).send({ message: 'No approvers found' })
                                }
                            } else {
                                res.status(500).send({message:"Something's wrong in the server"});
                            }
                        })
                    break;
                case "Regional Area Manager":
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
                                            req.body.data.type, req.body.data.rfDate, req.body.data.requestor, req.body.data.baseBranch, req.body.data.region, req.body.data.email, 
                                            req.body.data.period, req.body.data.controlNo, req.body.data.rfAllowance, req.body.data.pendingRf,
                                            req.body.data.totalExpenses, req.body.data.cashOnHand, req.body.data.transpo, req.body.data.supplies,
                                            req.body.data.meals, req.body.data.others, req.body.data.total, req.body.data.purpose,
                                            null, null, null, null, null, null, approvers[0].ass_email, '',
                                            approvers[0].vpo_email, '', 'pending'
                                        ],
                                        (err, results, fields) => {
                                            if (!err) {
                                                branchdbConnection.query(query.getRfRequestByControlNo, (req.body.data.controlNo), (err, request, fields) =>{
                                                    if (!err) {
                                                        if (!request.length == 0) {
                                                            console.log('REQUEST',request[0]);
                                                            sendEmailRf(request[0]).then(response => {
                                                                if (response.accepted) {
                                                                    sendRfRequestor(request[0], request[0].ass_fullname, request[0].vpo_fullname).then(resp =>{
                                                                        if (resp.accepted) {
                                                                            res.send({message:"Request submitted successfully"});
                                                                        } else if (resp.rejected) {
                                                                            res.status(500).send({message:"Network Error"});
                                                                        }
                                                                    }).catch(err => {
                                                                        console.log(err);
                                                                        res.status(500).send({message:"Network Error"});
                                                                    })
                                                                } else if (response.rejected) {
                                                                    res.status(500).send({message: 'Network Error'});
                                                                }
                                                            }).catch(err => {
                                                                console.log(err);
                                                                res.status(500).send({message: 'Network Error'});
                                                            })
                                                            
                                                        } else {
                                                            res.status(404).send({message:'Failed to submit request'});
                                                            console.log(request.length);
                                                        }
                                                    } else {
                                                        res.status(500).send({message:"Something's wrong in the server"});
                                                    }
                                                })
                                            } else {
                                                res.status(500).send({message:"Something's wrong in the server"});
                                            }
                                        })
                                } else {
                                    res.status(404).send({ message: 'No approvers found' })
                                }
                            } else {
                                res.status(500).send({message:"Something's wrong in the server"});
                            }
                        })
                    break;
                case "Asst. to Vpo | Coo":
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
                                            req.body.data.type, req.body.data.rfDate, req.body.data.requestor, req.body.data.baseBranch, req.body.data.region,
                                            req.body.data.email, req.body.data.period, req.body.data.controlNo, req.body.data.rfAllowance, req.body.data.pendingRf,
                                            req.body.data.totalExpenses, req.body.data.cashOnHand, req.body.data.transpo, req.body.data.supplies,
                                            req.body.data.meals, req.body.data.others, req.body.data.total, req.body.data.purpose,
                                            null, null, null, null, null, null, approvers[0].ass_email, '',
                                            approvers[0].vpo_email, '', 'pending'
                                        ],
                                        (err, results, fields) => {
                                            if (!err) {
                                                branchdbConnection.query(query.getRfRequestByControlNo, (req.body.data.controlNo), (err, request, fields) =>{
                                                    if (!err) {
                                                        if (!request.length == 0) {
                                                            console.log(request[0]);
                                                            sendEmailRf(request[0]).then(response => {
                                                                if (response.accepted) {
                                                                    sendRfRequestor(request[0], request[0].vpo_fullname, '').then(resp =>{
                                                                        if (resp.accepted) {
                                                                        res.send({message:"Request submitted successfully"})
                                                                        } else if (resp.rejected) {
                                                                            res.status(500).send({message:"Network Error"});
                                                                        }
                                                                    }).catch(err => {
                                                                        console.log(err);
                                                                        res.status(500).send({message:"Network Error"});
                                                                    })
                                                                } else if (response.rejected) {
                                                                    res.status(500).send({message: 'Network Error'});
                                                                }
                                                            }).catch(err => {
                                                                console.log(err);
                                                                res.status(500).send({message:"Network Error"});
                                                            })
                                                            
                                                        } else {
                                                            res.status(404).send({message:'Failed to submit request'});
                                                            console.log(request.length);
                                                        }
                                                    } else {
                                                        res.status(500).send({message:"Something's wrong in the server"});
                                                    }
                                                })
                                            } else {
                                                res.status(500).send({message:"Something's wrong in the server"});
                                            }
                                        })
                                } else {
                                    res.status(404).send({ message: 'No approvers found' });
                                }
                            } else {
                                res.send({message:"Something's wrong in the server"});
                            }
                        })
                    break;
                case "Vpo":

                    break;
                default:
                    break;
            }

        } catch (error) {
            res.status(500).send({ message: "Something's wrong in the server. Please refresh the page and try again." });
        }
    },
}