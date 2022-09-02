const branchdbConnection = require('../config/branchDBConnection');
const setTransporter = require('../config/mailConfig');
const query = require('../config/queries');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const { _createPdfStream, _streamToBuffer } = require('../utils/generatePdf');
const Logger = require('../logs/logger');
const store = require('store');

const sendEmail = async (options) => {
  // console.log(store.get('access_token').access_token);
  // console.log(store.get('refresh_token'));
  let gmailTransporter = await setTransporter();
  // let gmailTransporter = await setTransporter(store.get('access_token').access_token, store.get('refresh_token').refresh_token);
  return await gmailTransporter.sendMail(options);
};

// CASH ADVANCE REQUEST
const updateApproverStatus = (res, status, controlno, approver_name, approver_status, approver_email, approver_fullname, next_approver, comment, approver_date) => {
  // APPROVED
  if (status === 'approved') {
    Logger.loggerInfo.addContext('context', 'CASH ADVANCE APPROVED  - ');
    Logger.loggerInfo.info(status, controlno, approver_name, approver_status, approver_email, approver_fullname, next_approver, comment, approver_date);
    let dateInstance = new Date();
    let date = ("0" + (dateInstance.getMonth() + 1)).slice(-2).toString() + "/" + ("0" + dateInstance.getDate()).slice(-2).toString() + "/" + dateInstance.getFullYear().toString();
    let time = dateInstance.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    let dateTime = `${date} | ${time}`;
    branchdbConnection.query(`UPDATE cash_advance_request SET ${approver_status} = '${status}', ${approver_date} =  '${dateTime}'  WHERE controlNo = '${controlno}'`, (err, fields) => {
      if (!err) {
        branchdbConnection.query(query.getRequestByControlNo, (controlno), (err, rows, fields) => {
          if (!err) {
            if (!rows.length == 0) {

              if (approver_status === 'vpo_status') {
                branchdbConnection.query(query.updateRequestStatus, [status, controlno], (err, fields) => {
                  if (!err) {

                    let approvedTemplate = fs.readFileSync(path.join(__dirname, '..', 'views', 'templates', 'approved_pdf.hbs'), 'utf-8');

                    let context = {
                      data: rows[0]

                    }
                    let template = handlebars.compile(approvedTemplate);

                    let DOC = template(context);

                    _createPdfStream(DOC).then((stream) => {
                      _streamToBuffer(stream, function (err, buffer) {
                        if (err) {
                          Logger.loggerError.addContext('context', 'CASH ADVANCE APPROVED -  PDF CONFIGURATION IN CASH ADVANCE - ');
                          Logger.loggerError.error(err);

                          throw new Error(err);
                        }

                        sendEmail({
                          subject: `Cash Advance ${controlno} REQUEST APPROVED`,
                          to: rows[0].email,
                          from: "'Cash Request <vpo-carf@mlhuillier.com>'",
                          template: "approved",
                          context: {
                            data: rows[0],
                          },
                          attachments: [{
                            filename: `CASH ADVANCE ${controlno}.pdf`,
                            content: buffer,
                            contentDisposition: 'application/pdf'
                          }]
                        });
                      });
                    });
                    Logger.loggerInfo.addContext('context', `CASH ADVANCE APPROVED - Report has been delivered to ${rows[0].email} - `);
                    Logger.loggerInfo.info(`Request Approved - ${controlno}`);

                    // res.send({ message: 'Request approved' })
                    // res.redirect(`http://localhost:8080/response/${controlno}`)
                    res.redirect(`/response/${controlno}`);

                  } else {
                    Logger.loggerError.addContext('context', 'CASH ADVANCE APPROVED -  updateApproverStatus - ');
                    Logger.loggerError.error(`Error updating request status, ${err}`);
                  }
                })
              } else {
                sendEmail(
                  {
                    subject: `Cash Advance ${controlno} For Approval`,
                    to: rows[0].email,
                    from: "'Cash Request <vpo-carf@mlhuillier.com>'",
                    template: "requestor",
                    context: {
                      message: 'Your request has been approved by',
                      comment: comment,
                      time: `at ${time} | ${date}`,
                      requestor: rows[0].author,
                      approver: approver_fullname,
                      next_approver: next_approver,
                      status: rows[0].request_status,
                      bgColor: 'rgb(248, 191, 125)',
                      color: 'rgb(184, 52, 4)',
                    }
                  }
                );
                setTimeout(() => {
                  sendEmail({
                    subject: `IMPORTANT! Cash Advance: ${controlno} For Approval`,
                    to: approver_email,
                    from: "'Cash Request <vpo-carf@mlhuillier.com>'",
                    template: "caButtons",
                    context: {
                      data: rows[0],
                      approver: approver_name
                    }
                  });

                  Logger.loggerInfo.addContext('context', `CASH ADVANCE APPROVED -  Request ${controlno} has been approved by ${approver_fullname} - `);
                  Logger.loggerInfo.info(`Request has been delivered to ${approver_email} for approval `);

                  // res.redirect(`http://localhost:8080/response/${controlno}`)
                  res.redirect(`/response/${controlno}`);
                  // res.send({ message: `Request has been delivered to ${approver_email}` })
                }, 3000);
                //   }
                //   else {
                //     Logger.loggerError.addContext('context', 'CASH ADVANCE APPROVED - updateApproverStatus -> update approval date - ')
                //     Logger.loggerError.error(`Can't update request approval date`)
                //   }
                // })
              }

            } else {
              Logger.loggerError.addContext('context', 'CASH ADVANCE APPROVED - updateApproverStatus -> getRequestByControlNo - ')
              Logger.loggerError.error(`No data retrieved with control no. ${controlno} - ${rows}`)
            }
          } else {
            Logger.loggerFatal.addContext('context', 'CASH ADVANCE APPROVED - updateApproverStatus -> getRequestByControlNo - ')
            Logger.loggerFatal.fatal(`Error retrieving data - ${err}`)
          }
        })
      } else {
        Logger.loggerFatal.addContext('context', `APPROVED - updateApproverStatus -> UPDATE cash_advance_request SET ${approver_status} = '${status}', ${approver_date} =  '${dateTime}' WHERE controlNo = '${controlno}'`)
        Logger.loggerFatal.fatal(`CASH ADVANCE ERROR - ${err}`);
      }
    })
    // DISAPPROVED
  } else if (status === 'disapproved') {
    Logger.loggerInfo.addContext('context', 'CASH ADVANCE DISAPPROVED  - ');
    Logger.loggerInfo.info(status, controlno, approver_name, approver_status, approver_email, approver_fullname, next_approver, comment, approver_date);

    let dateInstance = new Date();
    let date = ("0" + (dateInstance.getMonth() + 1)).slice(-2).toString() + "/" + ("0" + dateInstance.getDate()).slice(-2).toString() + "/" + dateInstance.getFullYear().toString();
    let time = dateInstance.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    let dateTime = `${date} | ${time}`;

    branchdbConnection.query(`UPDATE cash_advance_request SET ${approver_status} = '${status}' WHERE controlNo = '${controlno}'`, (err, fields) => {
      if (!err) {
        branchdbConnection.query(query.updateRequestStatus, [status, controlno], (err, fields) => {
          if (!err) {
            branchdbConnection.query(`UPDATE cash_advance_request SET ${approver_date} =  '${dateTime}' WHERE controlNo = '${controlno}'`, (err, resp, fields) => {
              if (!err) {
                branchdbConnection.query(query.getRequestByControlNo, (controlno), (err, rows, fields) => {
                  if (!err) {
                    if (!rows.length == 0) {
                      // generatePdf(`CASH ADVANCE ${controlno}`);
                      let approvedTemplate = fs.readFileSync(path.join(__dirname, '..', 'views', 'templates', 'approved_pdf.hbs'), 'utf-8');

                      let context = {
                        data: rows[0]

                      }
                      let template = handlebars.compile(approvedTemplate);

                      let DOC = template(context);

                      _createPdfStream(DOC).then((stream) => {
                        _streamToBuffer(stream, function (err, buffer) {
                          if (err) {
                            throw new Error(err);
                          }

                          sendEmail({
                            subject: `Cash Advance ${controlno} REQUEST DISAPPROVED`,
                            to: rows[0].email,
                            from: "'Cash Request <vpo-carf@mlhuillier.com>'",
                            template: "disapproved",
                            context: {
                              data: rows[0],
                              time: `at ${time} | ${date}`,
                              comment: comment,
                              requestor: rows[0].author,
                              approver: approver_fullname,
                              status: rows[0].request_status,
                              color: 'rgb(136, 31, 40)',
                              bgColor: 'rgb(238, 210, 210)',
                            },
                            attachments: [{
                              filename: `CASH ADVANCE ${controlno}.pdf`,
                              content: buffer,
                              contentDisposition: 'application/pdf'
                            }]
                          });
                        });
                      });
                      Logger.loggerInfo.addContext('context', `DISAPPROVED - Email was sent to ${rows[0].email} - `);
                      Logger.loggerInfo.info(`Request Disapproved - CASH ADVANCE ${controlno}`);
                      // res.redirect(`http://localhost:8080/response/${controlno}`)
                      res.redirect(`/response/${controlno}`);

                    } else {
                      Logger.loggerError.addContext('context', 'CASH ADVANCE DISAPPROVED - updateApproverStatus -> getRequestByControlNo - ')
                      Logger.loggerError.error(`No data retrieved with control no. ${controlno} - ${rows}`)
                    }
                  } else {
                    Logger.loggerFatal.addContext('context', 'CASH ADVANCE DISAPPROVED - updateApproverStatus -> getRequestByControlNo - ')
                    Logger.loggerFatal.fatal(`Error retrieving data - ${err}`)
                  }
                })
              }
              else {
                Logger.loggerError.addContext('context', 'CASH ADVANCE DISAPPROVED - updateApproverStatus -> update approval date - ')
                Logger.loggerError.error(`Can't update request approval date`)
              }
            })

          } else {
            Logger.loggerError.addContext('context', 'CASH ADVANCE DISAPPROVED - updateApproverStatus - ');
            Logger.loggerError.error(`Error updating request status - ${err}`);
          }
        })

      } else {
        Logger.loggerError.addContext('context', 'CASH ADVANCE DISAPPROVED - updateApproverStatus - ');
        Logger.loggerError.error(`Error updating ${approver_status} - ${err}`);
      }
    })
  }
}
// REVOLVING FUND REQUEST
const updateRfApproverStatus = (res, status, controlno, approver_name, approver_status, approver_email, approver_fullname, next_approver, comment, approver_date) => {
  // APPROVED
  if (status === 'approved') {
    Logger.loggerInfo.addContext('context', 'REVOLVING FUND APPROVED  - ');
    Logger.loggerInfo.info(status, controlno, approver_name, approver_status, approver_email, approver_fullname, next_approver, comment, approver_date);

    let dateInstance = new Date();
    let date = ("0" + (dateInstance.getMonth() + 1)).slice(-2).toString() + "/" + ("0" + dateInstance.getDate()).slice(-2).toString() + "/" + dateInstance.getFullYear().toString();
    let time = dateInstance.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    let dateTime = `${date} | ${time}`;

    branchdbConnection.query(`UPDATE revolving_fund_request SET ${approver_status} = '${status}', ${approver_date} =  '${dateTime}' WHERE controlNo = '${controlno}'`, (err, fields) => {
      if (!err) {
        branchdbConnection.query(query.getRfRequestByControlNo, (controlno), (err, rows, fields) => {
          if (!err) {
            if (!rows.length == 0) {
              if (approver_status === 'vpo_status') {
                branchdbConnection.query(query.updateRfRequestStatus, [status, controlno], (err, fields) => {
                  if (!err) {
                    let approvedTemplate = fs.readFileSync(path.join(__dirname, '..', 'views', 'templates', 'rfApproved_pdf.hbs'), 'utf-8');

                    let context = {
                      data: rows[0],
                      isNotVpo: true
                    }
                    let template = handlebars.compile(approvedTemplate);

                    let DOC = template(context);

                    _createPdfStream(DOC).then((stream) => {
                      _streamToBuffer(stream, function (err, buffer) {
                        if (err) {
                          throw new Error(err);
                        }
                        sendEmail({
                          subject: `Revolving Fund ${controlno} REQUEST APPROVED`,
                          to: rows[0].email,
                          from: "'Cash Request <vpo-carf@mlhuillier.com>'",
                          template: "rfApproved",
                          context: {
                            data: rows[0],
                          },
                          attachments: [{
                            filename: `REVOLVING FUND LIQUIDATION ${controlno}.pdf`,
                            content: buffer,
                            contentDisposition: 'application/pdf'
                          }]
                        });
                      });
                    });
                    // res.redirect(`http://localhost:8080/response/${controlno}`)
                    res.redirect(`/response/${controlno}`);
                    Logger.loggerInfo.addContext('context', `REVOLVING FUND APPROVED -  Request ${controlno} has been approved by ${approver_fullname} - `);
                    Logger.loggerInfo.info(`Request has been delivered to ${approver_email} for approval `);
                  } else {
                    Logger.loggerError.addContext('context', 'REVOLVING FUND APPROVED - updateApproverStatus - ');
                    Logger.loggerError.error('Error updating request status');
                  }
                })
              } else {
                sendEmail(
                  {
                    subject: `Revolving Fund ${controlno} For Approval`,
                    to: rows[0].email,
                    from: "'Cash Request <vpo-carf@mlhuillier.com>'",
                    template: "requestor",
                    context: {
                      message: 'Your request has been approved by',
                      time: `at ${time} | ${date}`,
                      comment: comment,
                      requestor: rows[0].requestor,
                      approver: approver_fullname,
                      next_approver: next_approver,
                      status: rows[0].request_status,
                      bgColor: 'rgb(248, 191, 125)',
                      color: 'rgb(184, 52, 4)',
                    }
                  }
                );
                setTimeout(() => {
                  sendEmail({
                    subject: `IMPORTANT! Revolving Fund: ${controlno} For Approval`,
                    to: approver_email,
                    from: "'Cash Request <vpo-carf@mlhuillier.com>'",
                    template: "rfButtons",
                    context: {
                      data: rows[0],
                      approver: approver_name
                    }
                  });
                  Logger.loggerInfo.addContext('context', `REVOLVING FUND APPROVED -  Request ${controlno} has been approved by ${approver_fullname} - `);
                  Logger.loggerInfo.info(`Request has been delivered to ${approver_email} for approval`);
                  // res.redirect(`http://localhost:8080/response/${controlno}`)
                  res.redirect(`/response/${controlno}`);
                }, 3000);
              }
            } else {
              Logger.loggerError.addContext('context', 'REVOLVING FUND APPROVED - updateApproverStatus -> getRequestByControlNo - ')
              Logger.loggerError.error(`No data retrieved with control no. ${controlno} - ${rows}`)
              // res.send({ message: `Request has been delivered to ${controlno}` })
            }
          } else {
            Logger.loggerFatal.addContext('context', 'REVOLVING FUND APPROVED - updateApproverStatus -> getRequestByControlNo - ')
            Logger.loggerFatal.fatal(`Error retrieving data - ${err}`)
          }
        })
      } else {
        Logger.loggerError.addContext('context', 'REVOLVING FUND APPROVED - updateApproverStatus - ');
        Logger.loggerError.error(`Error updating ${approver_status} - ${err}`);
      }
    })
    // DISAPPROVED
  } else if (status === 'disapproved') {
    Logger.loggerInfo.addContext('context', 'REVOLVING FUND DISAPPROVED  - ');
    Logger.loggerInfo.info(status, controlno, approver_name, approver_status, approver_email, approver_fullname, next_approver, comment, approver_date);

    let dateInstance = new Date();
    let date = ("0" + (dateInstance.getMonth() + 1)).slice(-2).toString() + "/" + ("0" + dateInstance.getDate()).slice(-2).toString() + "/" + dateInstance.getFullYear().toString();
    let time = dateInstance.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    let dateTime = `${date} | ${time}`;
    branchdbConnection.query(`UPDATE revolving_fund_request SET ${approver_status} = '${status}', ${approver_date} =  '${dateTime}' WHERE controlNo = '${controlno}'`, (err, fields) => {
      if (!err) {
        branchdbConnection.query(query.updateRfRequestStatus, [status, controlno], (err, fields) => {
          if (!err) {
            branchdbConnection.query(query.getRfRequestByControlNo, (controlno), (err, rows, fields) => {
              if (!err) {
                if (!rows.length == 0) {
                  sendEmail({
                    subject: `Revolving Fund ${controlno} REQUEST DISAPPROVED`,
                    to: rows[0].email,
                    from: "'Cash Request <vpo-carf@mlhuillier.com>'",
                    template: "rfDisapproved",
                    context: {
                      data: rows[0],
                      time: `at ${time} | ${date}`,
                      comment: comment,
                      requestor: rows[0].requestor,
                      approver: approver_fullname,
                      status: rows[0].request_status,
                      color: 'rgb(136, 31, 40)',
                      bgColor: 'rgb(238, 210, 210)',
                    },

                  });

                  // res.redirect(`http://localhost:8080/response/${controlno}`)
                  res.redirect(`/response/${controlno}`);
                  Logger.loggerInfo.addContext('context', `REVOLVING FUND DISAPPROVED - Email was sent to ${rows[0].email} - `);
                  Logger.loggerInfo.info(`Request Disapproved - ${controlno}`);
                } else {
                  Logger.loggerError.addContext('context', 'REVOLVING FUND DISAPPROVED - updateApproverStatus -> getRequestByControlNo - ')
                  Logger.loggerError.error(`No data retrieved with control no. ${controlno} - ${rows}`)
                }
              } else {
                Logger.loggerFatal.addContext('context', 'REVOLVING FUND DISAPPROVED - updateApproverStatus -> getRequestByControlNo - ')
                Logger.loggerFatal.fatal(`Error retrieving data with control no - ${err}`)
              }
            })
          } else {
            Logger.loggerError.addContext('context', 'REVOLVING FUND DISAPPROVED - updateApproverStatus - ');
            Logger.loggerError.error(`Error updating request status - ${err}`);

          }
        })

      } else {
        console.log(err);
        Logger.loggerError.addContext('context', 'REVOLVING FUND DISAPPROVED - updateApproverStatus - ');
        Logger.loggerError.error(`Error updating ${approver_status} - ${err}`);
      }
    })
  }
}


module.exports = {
  updateRfApproverStatus,
  sendMail(rows) {

    let send = sendEmail(
      {
        subject: `IMPORTANT! Cash Advance: ${rows[0].controlNo} For Approval`,
        text: 'Your approval is required for a request to proceed with its execution.',
        to: rows[0].area_approver,
        from: "'Cash Request <vpo-carf@mlhuillier.com>'",
        template: "caButtons",
        context: {
          data: rows[0],
          approver: 'area_approver'
        }
      }
    );
    return (send)
  },
  sendEmailNotificationRequestor(request_rows) {

    let controlNo = request_rows[0].controlNo;

    let send = sendEmail(
      {
        subject: `Cash Advance ${controlNo} For Approval`,
        to: request_rows[0].email,
        from: "'Cash Request <vpo-carf@mlhuillier.com>'",
        template: "requestor",
        context: {
          message: 'Your request has been delivered to',
          requestor: request_rows[0].author,
          approver: request_rows[0].am_fullname,
          next_approver: request_rows[0].am_fullname,
          status: request_rows[0].request_status,
          bgColor: 'rgb(248, 191, 125)',
          color: 'rgb(184, 52, 4)',
        }
      }
    );
    return send
  },
  // CASH ADVANCE
  requestStatus(req, res) {
    try {

      let controlNo = req.params.controlNo;
      let approver = req.params.approver;
      let comment = req.body.comment;
      let dateInstance = new Date();

      // IF APPROVE IS CLICKED
      if (req.body.approved) {
        branchdbConnection.query(query.getRequestByControlNo, (controlNo), (err, request, fields) => {
          if (!err) {
            if (!request.length == 0) {
              if (request[0].request_status === 'pending') {
                if (approver === 'area_approver') {
                  if (request[0].am_status === '') {
                    updateApproverStatus(res, 'approved', controlNo, 'regional_approver', 'am_status', request[0].regional_approver, request[0].am_fullname, request[0].rm_fullname, comment, 'am_date')
                  } else {
                    Logger.loggerInfo.addContext('context', `area_approver - ${request[0].am_status}`);
                    Logger.loggerInfo.info(`${request[0].am_fullname} already responded`);
                    // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                    res.redirect(`/alert/${controlNo}`)
                  }
                } else if (approver === 'regional_approver') {
                  if (request[0].rm_status === '') {
                    updateApproverStatus(res, 'approved', controlNo, 'ram_approver', 'rm_status', request[0].ram_approver, request[0].rm_fullname, request[0].ram_fullname, comment, 'rm_date')
                  }
                  else {
                    Logger.loggerInfo.addContext('context', `regional_approver - ${request[0].rm_status}`);
                    Logger.loggerInfo.info(`${request[0].rm_fullname} already responded`);
                    // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                    res.redirect(`/alert/${controlNo}`)
                  }
                } else if (approver === 'ram_approver') {
                  if (request[0].ram_status === '') {
                    updateApproverStatus(res, 'approved', controlNo, 'ass_vpo_approver', 'ram_status', request[0].ass_vpo_approver, request[0].ram_fullname, request[0].ass_fullname, comment, 'ram_date')
                  } else {
                    Logger.loggerInfo.addContext('context', `ram_approver - ${request[0].ram_status}`);
                    Logger.loggerInfo.info(`${request[0].ram_fullname} already responded`);
                    // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                    res.redirect(`/alert/${controlNo}`)
                  }
                } else if (approver === 'ass_vpo_approver') {
                  if (request[0].ass_status === '') {
                    updateApproverStatus(res, 'approved', controlNo, 'vpo_approver', 'ass_status', request[0].vpo_approver, request[0].ass_fullname, request[0].vpo_fullname, comment, 'ass_date')
                  } else {
                    Logger.loggerInfo.addContext('context', `ass_vpo_approver - ${request[0].ass_vpo_status}`);
                    Logger.loggerInfo.info(`${request[0].ass_vpo_fullname} already responded`);
                    // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                    res.redirect(`/alert/${controlNo}`)
                  }
                } else if (approver === 'vpo_approver') {
                  if (request[0].vpo_status === '') {
                    updateApproverStatus(res, 'approved', controlNo, 'vpo_approver', 'vpo_status', request[0].email, request[0].vpo_fullname, '', comment, 'vpo_date')
                  } else {
                    Logger.loggerInfo.addContext('context', `vpo_approver - ${request[0].vpo_status}`);
                    Logger.loggerInfo.info(`${request[0].vpo_fullname} already responded`);
                    // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                    res.redirect(`/alert/${controlNo}`)
                  }
                }

              } else {
                if (approver === 'area_approver') {
                  Logger.loggerInfo.addContext('context', `area_approver - ${request[0].am_status}`);
                  Logger.loggerInfo.info(`${request[0].am_fullname} already responded`);
                  // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  res.redirect(`/alert/${controlNo}`)
                } else if (approver === 'regional_approver') {
                  Logger.loggerInfo.addContext('context', `regional_approver - ${request[0].rm_status}`);
                  Logger.loggerInfo.info(`${request[0].rm_fullname} already responded`);
                  // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  res.redirect(`/alert/${controlNo}`)
                } else if (approver === 'ram_approver') {
                  Logger.loggerInfo.addContext('context', `ram_approver - ${request[0].ram_status}`);
                  Logger.loggerInfo.info(`${request[0].ram_fullname} already responded`);
                  // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  res.redirect(`/alert/${controlNo}`)
                } else if (approver === 'ass_vpo_approver') {
                  Logger.loggerInfo.addContext('context', `ass_vpo_approver - ${request[0].ass_status}`);
                  Logger.loggerInfo.info(`${request[0].ass_fullname} already responded`);
                  // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  res.redirect(`/alert/${controlNo}`)
                } else if (approver === 'vpo_approver') {
                  Logger.loggerInfo.addContext('context', `vpo_approver - ${request[0].vpo_status}`);
                  Logger.loggerInfo.info(`${request[0].vpo_fullname} already responded`);
                  // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  res.redirect(`/alert/${controlNo}`)
                }
              }
            } else {
              Logger.loggerError.addContext('context', `approved requestStatus -> getRequestByControlNo`);
              Logger.loggerError.error(`No data found ${request}`);
            }
          }
          else {
            Logger.loggerError.addContext('context', 'approved requestStatus -> getRequestByControlNo - ');
            Logger.loggerError.error(`Error retrieving data with contol no ${controlNo} - ${err}`);
          }
        })
        // IF DISAPPROVE IS CLICKED
      } else if (req.body.disapproved) {
        branchdbConnection.query(query.getRequestByControlNo, (controlNo), (err, request, fields) => {
          if (!err) {
            if (!request.length == 0) {
              if (request[0].request_status === "pending") {
                if (req.body.comment) {
                  if (approver === 'area_approver') {
                    if (request[0].am_status === '') {

                      updateApproverStatus(res, 'disapproved', controlNo, 'regional_approver', 'am_status', request[0].regional_approver, request[0].am_fullname, request[0].rm_fullname, comment, 'am_date')
                    } else {
                      Logger.loggerInfo.addContext('context', `area_approver - ${request[0].am_status}`);
                      Logger.loggerInfo.info(`${request[0].am_fullname} already responded`);
                      // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                      res.redirect(`/alert/${controlNo}`)
                    }
                  } else if (approver === 'regional_approver') {
                    if (request[0].rm_status === '') {
                      updateApproverStatus(res, 'disapproved', controlNo, 'ram_approver', 'rm_status', request[0].ram_approver, request[0].rm_fullname, request[0].ram_fullname, comment, 'rm_date')
                    }
                    else {
                      Logger.loggerInfo.addContext('context', `regional_approver - ${request[0].rm_status}`);
                      Logger.loggerInfo.info(`${request[0].rm_fullname} already responded`);
                      // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                      res.redirect(`/alert/${controlNo}`)
                    }
                  } else if (approver === 'ram_approver') {
                    if (request[0].ram_status === '') {
                      updateApproverStatus(res, 'disapproved', controlNo, 'ass_vpo_approver', 'ram_status', request[0].ass_vpo_approver, request[0].ram_fullname, request[0].ass_fullname, comment, 'ram_date')
                    } else {
                      Logger.loggerInfo.addContext('context', `ram_approver - ${request[0].ram_status}`);
                      Logger.loggerInfo.info(`${request[0].ram_fullname} already responded`);
                      // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                      res.redirect(`/alert/${controlNo}`)
                    }
                  } else if (approver === 'ass_vpo_approver') {
                    if (request[0].ass_status === '') {
                      updateApproverStatus(res, 'disapproved', controlNo, 'vpo_approver', 'ass_status', request[0].vpo_approver, request[0].ass_fullname, request[0].vpo_fullname, comment, 'ass_date')
                    } else {
                      Logger.loggerInfo.addContext('context', `ass_vpo_approver - ${request[0].ass_status}`);
                      Logger.loggerInfo.info(`${request[0].ass_fullname} already responded`);
                      // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                      res.redirect(`/alert/${controlNo}`)
                    }
                  } else if (approver === 'vpo_approver') {
                    if (request[0].vpo_status === '') {
                      updateApproverStatus(res, 'disapproved', controlNo, 'vpo_approver', 'vpo_status', request[0].email, request[0].vpo_fullname, '', comment, 'vpo_date')
                    } else {
                      Logger.loggerInfo.addContext('context', `vpo_approver - ${request[0].vpo_status}`);
                      Logger.loggerInfo.info(`${request[0].vpo_fullname} already responded`);
                      // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                      res.redirect(`/alert/${controlNo}`)
                    }
                  }

                } else {
                  Logger.loggerInfo.addContext('context', `mailController - requestStatus - `);
                  Logger.loggerInfo.info(`Comment: ${req.body.comment}`);
                  // res.redirect(`http://localhost:8080/alert-comment/${controlNo}`);
                  res.redirect(`/alert-comment/${controlNo}`)
                }
              } else {
                if (approver === 'area_approver') {
                  Logger.loggerInfo.addContext('context', `area_approver - ${request[0].am_status}`);
                  Logger.loggerInfo.info(`${request[0].am_fullname} already responded`);
                  // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  res.redirect(`/alert/${controlNo}`)
                } else if (approver === 'regional_approver') {
                  Logger.loggerInfo.addContext('context', `regional_approver - ${request[0].rm_status}`);
                  Logger.loggerInfo.info(`${request[0].rm_fullname} already responded`);
                  // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  res.redirect(`/alert/${controlNo}`)
                } else if (approver === 'ram_approver') {
                  Logger.loggerInfo.addContext('context', `ram_approver - ${request[0].ram_status}`);
                  Logger.loggerInfo.info(`${request[0].ram_fullname} already responded`);
                  // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  res.redirect(`/alert/${controlNo}`)
                } else if (approver === 'ass_vpo_approver') {
                  Logger.loggerInfo.addContext('context', `ass_vpo_approver - ${request[0].ass_status}`);
                  Logger.loggerInfo.info(`${request[0].ass_fullname} already responded`);
                  // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  res.redirect(`/alert/${controlNo}`)
                } else if (approver === 'vpo_approver') {
                  Logger.loggerInfo.addContext('context', `vpo_approver - ${request[0].vpo_status}`);
                  Logger.loggerInfo.info(`${request[0].vpo_fullname} already responded`);
                  // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  res.redirect(`/alert/${controlNo}`)
                }
              }
            }
            else {
              Logger.loggerError.addContext('context', `disapproved requestStatus -> getRequestByControlNo`);
              Logger.loggerError.error(`No data found ${request}`);
            }
          }
          else {
            Logger.loggerError.addContext('context', 'disapproved requestStatus -> getRequestByControlNo - ');
            Logger.loggerError.error(`Error retrieving data with contol no ${controlNo} - ${err}`);
          }
        })
      }
    } catch (error) {
      Logger.loggerFatal.addContext('context', `requestStatus`);
      Logger.loggerFatal.fatal(`Method Error ${error}`)
    }
  },

  //REVOLVING FUND REQUEST
  sendRfRequestor(rows, approver) {
    let send = sendEmail(
      {
        subject: `Revolving Fund: ${rows.controlNo} For Approval`,
        text: 'Your approval is required for a request to proceed with its execution.',
        to: rows.email,
        from: "'Cash Request <jonalyn.mobilla@mlhuillier>'",
        template: "requestor",
        context: {
          message: 'Your request has been delivered to',
          requestor: rows.requestor,
          approver: approver,
          next_approver: approver,
          status: rows.request_status,
          bgColor: 'rgb(248, 191, 125)',
          color: 'rgb(184, 52, 4)',
        }
      }
    );
    return (send)
  },

  sendEmailRf(rows) {
    if (rows.type === 'Branch Manager') {
      let send = sendEmail(
        {
          subject: `IMPORTANT! Revolving Fund: ${rows.controlNo} For Approval`,
          text: 'Your approval is required for a request to proceed with its execution.',
          to: rows.am_approver,
          from: "'Cash Request <jonalyn.mobilla@mlhuillier>'",
          template: "rfButtons",
          context: {
            data: rows,
            approver: 'am_approver'
          }
        }
      );
      return (send)
    } else if (rows.type === 'Area Manager') {
      let send = sendEmail(
        {
          subject: `IMPORTANT! Revolving Fund: ${rows.controlNo} For Approval`,
          text: 'Your approval is required for a request to proceed with its execution.',
          to: rows.rm_approver,
          from: "'Cash Request <jonalyn.mobilla@mlhuillier>'",
          template: "rfButtons",
          context: {
            data: rows,
            approver: 'rm_approver'
          }
        }
      );
      return (send)
    } else if (rows.type === 'Regional Manager') {
      let send = sendEmail(
        {
          subject: `IMPORTANT! Revolving Fund: ${rows.controlNo} For Approval`,
          text: 'Your approval is required for a request to proceed with its execution.',
          to: rows.ram_approver,
          from: "'Cash Request <jonalyn.mobilla@mlhuillier>'",
          template: "rfButtons",
          context: {
            data: rows,
            approver: 'ram_approver'
          }
        }
      );
      return (send)
    } else if (rows.type === 'Regional Area Manager') {
      let send = sendEmail(
        {
          subject: `IMPORTANT! Revolving Fund: ${rows.controlNo} For Approval`,
          text: 'Your approval is required for a request to proceed with its execution.',
          to: rows.ass_vpo_approver,
          from: "'Cash Request <jonalyn.mobilla@mlhuillier>'",
          template: "rfButtons",
          context: {
            data: rows,
            approver: 'ass_approver'
          }
        }
      );
      return (send)
    } else if (rows.type === 'Asst. to Vpo | Coo') {
      let send = sendEmail(
        {
          subject: `IMPORTANT! Revolving Fund: ${rows.controlNo} For Approval`,
          text: 'Your approval is required for a request to proceed with its execution.',
          to: rows.vpo_approver,
          from: "'Cash Request <jonalyn.mobilla@mlhuillier>'",
          template: "rfButtons",
          context: {
            data: rows,
            approver: 'vpo_approver'
          }
        }
      );
      return (send)
    }
  },

  rfRequestFlow(req, res) {
    try {

      let controlNo = req.params.controlNo;
      let approver = req.params.approver;
      let comment = req.body.comment;

      // IF APPROVE IS CLICKED
      if (req.body.approved) {
        Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow -`);
        Logger.loggerInfo.info(`req.body.approved : ${req.body.approved}`);
        branchdbConnection.query(query.getRfRequestByControlNo, (controlNo), (err, request, fields) => {
          if (!err) {
            if (!request.length == 0) {
              if (request[0].request_status === 'pending') {
                Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow -`);
                Logger.loggerInfo.info(`request_status: ${request[0].request_status}`);
                if (approver === 'am_approver') {
                  if (request[0].am_status === '') {
                    updateRfApproverStatus(res, 'approved', controlNo, 'rm_approver', 'am_status', request[0].rm_approver, request[0].am_fullname, request[0].rm_fullname, comment, 'am_date')
                  } else {
                    Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow - ${req.body.approved} - area_approver - ${request[0].am_status}`);
                    Logger.loggerInfo.info(`${request[0].am_fullname} already responded`);
                    // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                    res.redirect(`/alert/${controlNo}`)
                  }
                } else if (approver === 'rm_approver') {
                  if (request[0].rm_status === '') {
                    updateRfApproverStatus(res, 'approved', controlNo, 'ram_approver', 'rm_status', request[0].ram_approver, request[0].rm_fullname, request[0].ram_fullname, comment, 'rm_date')
                  }
                  else {
                    Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow - ${req.body.approved} - rm_approver - ${request[0].rm_status}`);
                    Logger.loggerInfo.info(`${request[0].rm_fullname} already responded`);
                    // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                    res.redirect(`/alert/${controlNo}`)
                  }
                } else if (approver === 'ram_approver') {
                  if (request[0].ram_status === '') {
                    updateRfApproverStatus(res, 'approved', controlNo, 'ass_approver', 'ram_status', request[0].ass_vpo_approver, request[0].ram_fullname, request[0].ass_fullname, comment, 'ram_date')
                  } else {
                    Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow - ${req.body.approved} -  ram_approver - ${request[0].ram_status}`);
                    Logger.loggerInfo.info(`${request[0].ram_fullname} already responded`);
                    // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                    res.redirect(`/alert/${controlNo}`)
                  }
                } else if (approver === 'ass_approver') {
                  if (request[0].ass_status === '') {
                    updateRfApproverStatus(res, 'approved', controlNo, 'vpo_approver', 'ass_status', request[0].vpo_approver, request[0].ass_fullname, request[0].vpo_fullname, comment, 'ass_date')
                  } else {
                    Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow - ${req.body.approved} - ass_approver - ${request[0].ass_status}`);
                    Logger.loggerInfo.info(`${request[0].ass_fullname} already responded`);
                    // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                    res.redirect(`/alert/${controlNo}`)
                  }
                } else if (approver === 'vpo_approver') {
                  if (request[0].vpo_status === '') {
                    updateRfApproverStatus(res, 'approved', controlNo, 'vpo_approver', 'vpo_status', request[0].email, request[0].vpo_fullname, '', comment, 'vpo_date')
                  } else {
                    Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow - ${req.body.approved} - vpo_approver - ${request[0].vpo_status}`);
                    Logger.loggerInfo.info(`${request[0].vpo_fullname} already responded`);
                    // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                    res.redirect(`/alert/${controlNo}`)
                  }
                }

              } else {
                Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow -`);
                Logger.loggerInfo.info(`request_status: ${request[0].request_status}`);
                if (approver === 'am_approver') {
                  Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow - ${req.body.approved} - am_approver - ${request[0].am_status}`);
                  Logger.loggerInfo.info(`${request[0].vpo_fullname} already responded`);
                  // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  res.redirect(`/alert/${controlNo}`)
                } else if (approver === 'rm_approver') {
                  Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow - ${req.body.approved} - rm_approver - ${request[0].rm_status}`);
                  Logger.loggerInfo.info(`${request[0].rm_fullname} already responded`);
                  // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  res.redirect(`/alert/${controlNo}`)
                } else if (approver === 'ram_approver') {
                  Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow - ${req.body.approved} - ram_approver - ${request[0].ram_status}`);
                  Logger.loggerInfo.info(`${request[0].ram_fullname} already responded`);
                  // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  res.redirect(`/alert/${controlNo}`)
                } else if (approver === 'ass_approver') {
                  Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow - ${req.body.approved} - ass_approver - ${request[0].ass_status}`);
                  Logger.loggerInfo.info(`${request[0].ass_fullname} already responded`);
                  // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  res.redirect(`/alert/${controlNo}`)
                } else if (approver === 'vpo_approver') {
                  Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow - ${req.body.approved} - vpo_approver - ${request[0].vpo_status}`);
                  Logger.loggerInfo.info(`${request[0].vpo_fullname} already responded`);
                  // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  res.redirect(`/alert/${controlNo}`)
                }
              }
            }
            else {
              Logger.loggerError.addContext('context', `mailController - rfRequestFlow - getRfRequestByControlNo - ${req.body.approved} -`);
              Logger.loggerError.error(`No data found ${request}`);
            }
          }
          else {
            Logger.loggerError.addContext('context', `mailController - rfRequestFlow - getRfRequestByControlNo - ${req.body.approved} -`);
            Logger.loggerError.error(`Error retrieving data ${err}`);
          }
        })
        // IF DISAPPROVE IS CLICKED
      } else if (req.body.disapproved) {
        Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow -`);
        Logger.loggerInfo.info(`req.body.disapproved : ${req.body.disapproved}`);
        branchdbConnection.query(query.getRfRequestByControlNo, (controlNo), (err, request, fields) => {
          if (!err) {
            if (!request.length == 0) {
              if (request[0].request_status === "pending") {
                Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow -`);
                Logger.loggerInfo.info(`request_status: ${request[0].request_status}`);
                if (req.body.comment) {
                  if (approver === 'am_approver') {
                    if (request[0].am_status === '') {
                      updateRfApproverStatus(res, 'disapproved', controlNo, 'rm_approver', 'am_status', request[0].rm_approver, request[0].am_fullname, request[0].rm_fullname, comment, 'am_date')
                    } else {
                      Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow - am_approver - ${request[0].am_status}`);
                      Logger.loggerInfo.info(`${request[0].am_fullname} already responded`);
                      // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                      res.redirect(`/alert/${controlNo}`)
                    }
                  } else if (approver === 'rm_approver') {
                    if (request[0].rm_status === '') {
                      updateRfApproverStatus(res, 'disapproved', controlNo, 'ram_approver', 'rm_status', request[0].ram_approver, request[0].rm_fullname, request[0].ram_fullname, comment, 'rm_date')
                    }
                    else {
                      Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow - rm_approver - ${request[0].rm_status}`);
                      Logger.loggerInfo.info(`${request[0].rm_fullname} already responded`);
                      // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                      res.redirect(`/alert/${controlNo}`)
                    }
                  } else if (approver === 'ram_approver') {
                    if (request[0].ram_status === '') {
                      updateRfApproverStatus(res, 'disapproved', controlNo, 'ass_approver', 'ram_status', request[0].ass_vpo_approver, request[0].ram_fullname, request[0].ass_fullname, comment, 'ram_date')
                    } else {
                      Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow - ram_approver - ${request[0].ram_status}`);
                      Logger.loggerInfo.info(`${request[0].ram_fullname} already responded`);
                      // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                      res.redirect(`/alert/${controlNo}`)
                    }
                  } else if (approver === 'ass_approver') {
                    if (request[0].ass_status === '') {
                      updateRfApproverStatus(res, 'disapproved', controlNo, 'vpo_approver', 'ass_status', request[0].vpo_approver, request[0].ass_fullname, request[0].vpo_fullname, comment, 'ass_date')
                    } else {
                      Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow - ass_approver - ${request[0].ass_status}`);
                      Logger.loggerInfo.info(`${request[0].ass_fullname} already responded`);
                      // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                      res.redirect(`/alert/${controlNo}`)
                    }
                  } else if (approver === 'vpo_approver') {
                    if (request[0].vpo_status === '') {
                      updateRfApproverStatus(res, 'disapproved', controlNo, 'vpo_approver', 'vpo_status', request[0].email, request[0].vpo_fullname, '', comment, 'vpo_date')
                    } else {
                      Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow - vpo_approver - ${request[0].vpo_status}`);
                      Logger.loggerInfo.info(`${request[0].vpo_fullname} already responded`);
                      // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                      res.redirect(`/alert/${controlNo}`)
                    }
                  }

                } else {
                  Logger.loggerInfo.addContext('context', `mailController - requestStatus - `);
                  Logger.loggerInfo.info(`Comment: ${req.body.comment}`);
                  // res.redirect(`http://localhost:8080/alert-comment/${controlNo}`);
                  res.redirect(`/alert-comment/${controlNo}`)
                }
              } else {
                Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow -`);
                Logger.loggerInfo.info(`request_status: ${request[0].request_status}`);
                if (approver === 'am_approver') {
                  Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow - am_approver - ${request[0].am_status}`);
                  Logger.loggerInfo.info(`${request[0].am_fullname} already responded`);
                  // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  res.redirect(`/alert/${controlNo}`)
                } else if (approver === 'rm_approver') {
                  Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow - rm_approver - ${request[0].rm_status}`);
                  Logger.loggerInfo.info(`${request[0].rm_fullname} already responded`);
                  // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  res.redirect(`/alert/${controlNo}`)
                } else if (approver === 'ram_approver') {
                  Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow - ram_approver - ${request[0].ram_status}`);
                  Logger.loggerInfo.info(`${request[0].ram_fullname} already responded`);
                  // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  res.redirect(`/alert/${controlNo}`)
                } else if (approver === 'ass_approver') {
                  Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow - ass_approver - ${request[0].ass_status}`);
                  Logger.loggerInfo.info(`${request[0].ass_fullname} already responded`);
                  // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  res.redirect(`/alert/${controlNo}`)
                } else if (approver === 'vpo_approver') {
                  Logger.loggerInfo.addContext('context', `mailController - rfRequestFlow - vpo_approver - ${request[0].vpo_status}`);
                  Logger.loggerInfo.info(`${request[0].vpo_fullname} already responded`);
                  // res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  res.redirect(`/alert/${controlNo}`)
                }
              }
            }
            else {
              Logger.loggerError.addContext('context', `mailController - rfRequestFlow - getRfRequestByControlNo - ${req.body.disapproved} -`);
              Logger.loggerError.error(`No data found ${request}`);
            }
          }
          else {
            Logger.loggerError.addContext('context', `mailController - rfRequestFlow - getRfRequestByControlNo - ${req.body.disapproved} -`);
            Logger.loggerError.error(`Error retrieving data ${err}`);
          }
        })
      }
    } catch (error) {
      Logger.loggerFatal.addContext('context', `rfRequestFlow`);
      Logger.loggerFatal.fatal(`Method Error ${error}`)
    }
  },

  // FOR TESTING
  getComment(req, res) {
    res.redirect('http://localhost:8080/cash-advance')
  },
  send(req, res) {
    sendEmail({
      subject: 'Exploring Gmail API',
      text: 'Hello welcome to my blog',
      to: 'jonalyn.mobilla@mlhuillier.com',
      from: '"Cash Request"<cashrequest@mlhuillier.com>',
      template: 'requestor',
    }).then(resp => {
      console.log(resp);
      res.send(resp)
    }).catch(err => {
      console.log(err);
      res.send(err)
    })
  },
  testing(req, res) {
    try {
      let isNotVpo;
      let controlno = 'RF-220804-000025';
      branchdbConnection.query(query.getRfRequestByControlNo, (controlno), (err, result, field) => {
        if (!err) {
          if (!result.length == 0) {
            console.log(result[0]);
            if (result[0].type === 'Vpo') {
              isNotVpo = false
            } else {
              isNotVpo = true
            }
            let approvedTemplate = fs.readFileSync(path.join(__dirname, '..', 'views', 'templates', 'sample_pdf.hbs'), 'utf-8');

            let context = {
              data: result[0],
              isNotVpo:isNotVpo
            }
            let template = handlebars.compile(approvedTemplate);

            let DOC = template(context);

            _createPdfStream(DOC).then((stream) => {
              _streamToBuffer(stream, function (err, buffer) {
                if (err) {
                  throw new Error(err);
                }
                let namePDF = "Control No";
                res.setHeader('Content-disposition', "inline; filename*=UTF-8''" + namePDF);
                res.setHeader('Content-type', 'application/pdf');
                return res.send(buffer);
              });
            });

          } else {
            console.log(`NO DATA FOUND ${result.length}`);
          }
        } else {
          console.log(`ERROR RETRIEVING DATA ${err}`);
        }
      })
    } catch (error) {
      res.json({ err: error });
    }
  },

}