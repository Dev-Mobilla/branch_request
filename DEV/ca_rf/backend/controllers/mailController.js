const branchdbConnection = require('../config/branchDBConnection');
const setTransporter = require('../config/mailConfig');
const query = require('../config/queries');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const { _createPdfStream, _streamToBuffer } = require('../utils/generatePdf');

const sendEmail = async (options) => {
  let gmailTransporter = await setTransporter();
  return await gmailTransporter.sendMail(options);
};

// CASH ADVANCE REQUEST
const updateApproverStatus = (res, status, controlno, approver_name, approver_status, approver_email, approver_fullname, next_approver, comment) => {
  // APPROVED
  if (status === 'approved') {
    console.log(status);
    console.log(controlno);
    branchdbConnection.query(`UPDATE cash_advance_request SET ${approver_status} = '${status}' WHERE controlNo = '${controlno}'`, (err, fields) => {
      if (!err) {
        branchdbConnection.query(query.getRequestByControlNo, (controlno), (err, rows, fields) => {
          if (!err) {
            if (!rows.length == 0) {
              console.log(rows);
              if (approver_status === 'vpo_status') {
                branchdbConnection.query(query.updateRequestStatus, [status, controlno], (err, fields) => {
                  if (!err) {
                    let approvedTemplate = fs.readFileSync(path.join(__dirname, '..', 'views', 'templates', 'approved_pdf.hbs'), 'utf-8');

                    let context = {
                      data: rows[0]

                    }
                    let template = handlebars.compile(approvedTemplate);

                    let DOC = template(context);

                    console.log(DOC);

                    _createPdfStream(DOC).then((stream) => {
                      _streamToBuffer(stream, function (err, buffer) {
                        if (err) {
                          throw new Error(err);
                        }
                        console.log('BUFFER', buffer);
                        sendEmail({
                          subject: `Cash Advance ${controlno} REQUEST APPROVED`,
                          to: rows[0].email,
                          from: "'Cash Request <jonalyn.mobilla@mlhuillier>'",
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

                    res.redirect(`http://localhost:8080/response/${controlno}`)
                    // res.send({ message: 'Request approved' })

                  } else {
                    console.log('Error updating request status');
                    // res.send({ message: 'Error updating request status' });
                  }
                })
              } else {
                let dateInstance = new Date();
                let date = ("0" + (dateInstance.getMonth() + 1)).slice(-2).toString() + "/" + ("0" + dateInstance.getDate()).slice(-2).toString() + "/" + dateInstance.getFullYear().toString();
                let time = dateInstance.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

                sendEmail(
                  {
                    subject: `Cash Advance ${controlno} For Approval`,
                    to: rows[0].email,
                    from: "'Cash Request <jonalyn.mobilla@mlhuillier>'",
                    template: "requestor",
                    context: {
                      message: 'Your request has been approved by',
                      comment:comment,
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
                    from: "'Cash Request <jonalyn.mobilla@mlhuillier>'",
                    template: "caButtons",
                    context: {
                      data: rows[0],
                      approver: approver_name
                    }
                  });
                  res.redirect(`http://localhost:8080/response/${controlno}`)
                  // res.send({ message: `Request has been delivered to ${approver_email}` })
                }, 3000);
              }

            } else {
              console.log('No data retrieved with control no.', controlno);
              // res.send({ message: `Request has been delivered to ${controlno}` })
            }
          } else {
            console.log(`Error retrieving data ${err}`);
            // res.send({ message: `Error retrieving data${err}` });
          }
        })
      } else {
        console.log('ERROR', err);
      }
    })
    // DISAPPROVED
  } else if (status === 'disapproved') {

    branchdbConnection.query(`UPDATE cash_advance_request SET ${approver_status} = '${status}' WHERE controlNo = '${controlno}'`, (err, fields) => {
      if (!err) {
        branchdbConnection.query(query.updateRequestStatus, [status, controlno], (err, fields) => {
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

                  console.log(DOC);
                  let buff;

                  _createPdfStream(DOC).then((stream) => {
                    _streamToBuffer(stream, function (err, buffer) {
                      if (err) {
                        throw new Error(err);
                      }
                  //     console.log('BUFFER', buffer);
                  let dateInstance = new Date();
                  let date = ("0" + (dateInstance.getMonth() + 1)).slice(-2).toString() + "/" + ("0" + dateInstance.getDate()).slice(-2).toString() + "/" + dateInstance.getFullYear().toString();
                  let time = dateInstance.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

                  sendEmail({
                    subject: `Cash Advance ${controlno} REQUEST DISAPPROVED`,
                    to: rows[0].email,
                    from: "'Cash Request <jonalyn.mobilla@mlhuillier>'",
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
                      // path: path.join(__dirname, '..', 'controllers', 'sample.pdf')
                      contentDisposition: 'application/pdf'
                    }]
                  });
                  //     console.log('BUFF', buff);
                    });
                  });

                  res.redirect(`http://localhost:8080/response/${controlno}`)
                  // res.send({message:'Request disapproved'});

                } else {
                  console.log('No data retrieved with control no.', controlno);
                }
              } else {
                console.log(`Error retrieving data with control no - ${controlno}`);
              }
            })
          } else {
            console.log(`Error updating data ${err}`);

          }
        })

      } else {
        console.log(`Error updating data ${err}`);
      }
    })
  }
}
// REVOLVING FUND REQUEST
const updateRfApproverStatus = (res, status, controlno, approver_name, approver_status, approver_email, approver_fullname, next_approver, comment) => {
  // APPROVED
  if (status === 'approved') {
    console.log(status);
    console.log(controlno);
    branchdbConnection.query(`UPDATE revolving_fund_request SET ${approver_status} = '${status}' WHERE controlNo = '${controlno}'`, (err, fields) => {
      if (!err) {
        branchdbConnection.query(query.getRfRequestByControlNo, (controlno), (err, rows, fields) => {
          if (!err) {
            if (!rows.length == 0) {
              console.log(rows);
              if (approver_status === 'vpo_status') {
                branchdbConnection.query(query.updateRfRequestStatus, [status, controlno], (err, fields) => {
                  if (!err) {
                    let approvedTemplate = fs.readFileSync(path.join(__dirname, '..', 'views', 'templates', 'rfApproved_pdf.hbs'), 'utf-8');

                    let context = {
                      data: rows[0]
                    }
                    let template = handlebars.compile(approvedTemplate);

                    let DOC = template(context);

                    console.log(DOC);

                    _createPdfStream(DOC).then((stream) => {
                      _streamToBuffer(stream, function (err, buffer) {
                        if (err) {
                          throw new Error(err);
                        }
                        console.log('BUFFER', buffer);
                        sendEmail({
                          subject: `Revolving Fund ${controlno} REQUEST APPROVED`,
                          to: rows[0].email,
                          from: "'Cash Request <jonalyn.mobilla@mlhuillier>'",
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

                    res.redirect(`http://localhost:8080/response/${controlno}`)
                    // res.send({ message: 'Request approved' })

                  } else {
                    console.log('Error updating request status');
                    // res.send({ message: 'Error updating request status' });
                  }
                })
              } else {
                let dateInstance = new Date();
                let date = ("0" + (dateInstance.getMonth() + 1)).slice(-2).toString() + "/" + ("0" + dateInstance.getDate()).slice(-2).toString() + "/" + dateInstance.getFullYear().toString();
                let time = dateInstance.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

                sendEmail(
                  {
                    subject: `Revolving Fund ${controlno} For Approval`,
                    to: rows[0].email,
                    from: "'Cash Request <jonalyn.mobilla@mlhuillier>'",
                    template: "requestor",
                    context: {
                      message: 'Your request has been approved by',
                      time: `at ${time} | ${date}`,
                      comment:comment,
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
                    from: "'Cash Request <jonalyn.mobilla@mlhuillier>'",
                    template: "rfButtons",
                    context: {
                      data: rows[0],
                      approver: approver_name
                    }
                  });
                  res.redirect(`http://localhost:8080/response/${controlno}`)
                }, 3000);
              }

            } else {
              console.log('No data retrieved with control no.', controlno);
              // res.send({ message: `Request has been delivered to ${controlno}` })
            }
          } else {
            console.log(`Error retrieving data ${err}`);
            // res.send({ message: `Error retrieving data${err}` })
          }
        })
      } else {
        console.log('ERROR', err);
      }
    })
    // DISAPPROVED
  } else if (status === 'disapproved') {

    branchdbConnection.query(`UPDATE revolving_fund_request SET ${approver_status} = '${status}' WHERE controlNo = '${controlno}'`, (err, fields) => {
      if (!err) {
        branchdbConnection.query(query.updateRfRequestStatus, [status, controlno], (err, fields) => {
          if (!err) {
            branchdbConnection.query(query.getRfRequestByControlNo, (controlno), (err, rows, fields) => {
              if (!err) {
                if (!rows.length == 0) {
                  // let approvedTemplate = fs.readFileSync(path.join(__dirname, '..', 'views', 'templates', 'rfApproved_pdf.hbs'), 'utf-8');

                  // let context = {
                  //   data: rows[0]

                  // }
                  // let template = handlebars.compile(approvedTemplate);

                  // let DOC = template(context);

                  // _createPdfStream(DOC).then((stream) => {
                  //   _streamToBuffer(stream, function (err, buffer) {
                  //     if (err) {
                  //       throw new Error(err);
                  //     }
                  let dateInstance = new Date();
                  let date = ("0" + (dateInstance.getMonth() + 1)).slice(-2).toString() + "/" + ("0" + dateInstance.getDate()).slice(-2).toString() + "/" + dateInstance.getFullYear().toString();
                  let time = dateInstance.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

                  sendEmail({
                    subject: `Revolving Fund ${controlno} REQUEST DISAPPROVED`,
                    to: rows[0].email,
                    from: "'Cash Request <jonalyn.mobilla@mlhuillier>'",
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
                    // attachments: [{
                    //   filename: `REVOLVING FUND LIQUIDATION ${controlno}.pdf`,
                    //   content: buffer,
                    //   // path: path.join(__dirname, '..', 'controllers', 'sample.pdf')
                    //   contentDisposition: 'application/pdf'
                    // }]
                  });
                  //   });
                  // });

                  res.redirect(`http://localhost:8080/response/${controlno}`)
                  // res.send({message:'Request disapproved'});

                } else {
                  console.log('No data retrieved with control no.', controlno);
                }
              } else {
                console.log(`Error retrieving data with control no - ${controlno}`);
              }
            })
          } else {
            console.log(`Error updating data ${err}`);

          }
        })

      } else {
        console.log(`Error updating data ${err}`);
      }
    })
  }
}


module.exports = {

  sendMail(rows) {
    // console.log(rows);

    let send = sendEmail(
      {
        subject: `IMPORTANT! Cash Advance: ${rows[0].controlNo} For Approval`,
        text: 'Your approval is required for a request to proceed with its execution.',
        to: rows[0].area_approver,
        from: "'Cash Request <jonalyn.mobilla@mlhuillier>'",
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
        from: "'Cash Request <jonalyn.mobilla@mlhuillier>'",
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

      // IF APPROVE IS CLICKED
      if (req.body.approved) {
        branchdbConnection.query(query.getRequestByControlNo, (controlNo), (err, request, fields) => {
          if (!err) {
            if (!request.length == 0) {
              console.log(request.length);
              if (request[0].request_status === 'pending') {
                console.log(request[0].request_status);
                if (approver === 'area_approver') {
                  console.log(approver);
                  if (request[0].am_status === '') {
                    console.log(request[0].am_status);
                    updateApproverStatus(res, 'approved', controlNo, 'regional_approver', 'am_status', request[0].regional_approver, request[0].am_fullname, request[0].rm_fullname, comment)
                  } else {
                    res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  }
                } else if (approver === 'regional_approver') {
                  if (request[0].rm_status === '') {
                    updateApproverStatus(res, 'approved', controlNo, 'ram_approver', 'rm_status', request[0].ram_approver, request[0].rm_fullname, request[0].ram_fullname, comment)
                  }
                  else {
                    res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  }
                } else if (approver === 'ram_approver') {
                  if (request[0].ram_status === '') {
                    updateApproverStatus(res, 'approved', controlNo, 'ass_vpo_approver', 'ram_status', request[0].ass_vpo_approver, request[0].ram_fullname, request[0].ass_fullname, comment)
                  } else {
                    res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  }
                } else if (approver === 'ass_vpo_approver') {
                  if (request[0].ass_status === '') {
                    updateApproverStatus(res, 'approved', controlNo, 'vpo_approver', 'ass_status', request[0].vpo_approver, request[0].ass_fullname, request[0].vpo_fullname, comment)
                  } else {
                    res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  }
                } else if (approver === 'vpo_approver') {
                  if (request[0].vpo_status === '') {
                    updateApproverStatus(res, 'approved', controlNo, 'vpo_approver', 'vpo_status', request[0].email, request[0].vpo_fullname, '', comment)
                  } else {
                    res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  }
                }

              } else {
                if (approver === 'area_approver') {
                  res.redirect(`http://localhost:8080/alert/${controlNo}`);;
                } else if (approver === 'regional_approver') {
                  res.redirect(`http://localhost:8080/alert/${controlNo}`);
                } else if (approver === 'ram_approver') {
                  res.redirect(`http://localhost:8080/alert/${controlNo}`);
                } else if (approver === 'ass_vpo_approver') {
                  res.redirect(`http://localhost:8080/alert/${controlNo}`);
                } else if (approver === 'vpo_approver') {
                  res.redirect(`http://localhost:8080/alert/${controlNo}`);
                }
              }
            }
          }
          else {
            res.send({ err })
            console.log(err);
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

                      updateApproverStatus(res, 'disapproved', controlNo, 'regional_approver', 'am_status', request[0].regional_approver, request[0].am_fullname, request[0].rm_fullname, comment)
                    } else {
                      res.redirect(`http://localhost:8080/alert/${controlNo}`);
                    }
                  } else if (approver === 'regional_approver') {
                    if (request[0].rm_status === '') {
                      updateApproverStatus(res, 'disapproved', controlNo, 'ram_approver', 'rm_status', request[0].ram_approver, request[0].rm_fullname, request[0].ram_fullname, comment)
                    }
                    else {
                      res.redirect(`http://localhost:8080/alert/${controlNo}`);
                    }
                  } else if (approver === 'ram_approver') {
                    if (request[0].ram_status === '') {
                      updateApproverStatus(res, 'disapproved', controlNo, 'ass_vpo_approver', 'ram_status', request[0].ass_vpo_approver, request[0].ram_fullname, request[0].ass_fullname, comment)
                    } else {
                      res.redirect(`http://localhost:8080/alert/${controlNo}`);
                    }
                  } else if (approver === 'ass_vpo_approver') {
                    if (request[0].ass_status === '') {
                      updateApproverStatus(res, 'disapproved', controlNo, 'vpo_approver', 'ass_status', request[0].vpo_approver, request[0].ass_fullname, request[0].vpo_fullname, comment)
                    } else {
                      res.redirect(`http://localhost:8080/alert/${controlNo}`);
                    }
                  } else if (approver === 'vpo_approver') {
                    if (request[0].vpo_status === '') {
                      updateApproverStatus(res, 'disapproved', controlNo, 'vpo_approver', 'vpo_status', request[0].email, request[0].vpo_fullname, '', comment)
                    } else {
                      res.redirect(`http://localhost:8080/alert/${controlNo}`);
                    }
                  }

                } else {
                  res.redirect(`http://localhost:8080/alert-comment/${controlNo}`);
                }
              } else {
                if (approver === 'area_approver') {
                  res.redirect(`http://localhost:8080/alert/${controlNo}`);
                } else if (approver === 'regional_approver') {
                  res.redirect(`http://localhost:8080/alert/${controlNo}`);
                } else if (approver === 'ram_approver') {
                  res.redirect(`http://localhost:8080/alert/${controlNo}`);
                } else if (approver === 'ass_vpo_approver') {
                  res.redirect(`http://localhost:8080/alert/${controlNo}`);
                } else if (approver === 'vpo_approver') {
                  res.redirect(`http://localhost:8080/alert/${controlNo}`);
                }
              }
            }
            else {
              console.log('no data found', request);
            }
          }
          else {
            console.log(err);
          }
        })
      }
    } catch (error) {
      console.log('requestStatus', error);
    }
  },
  getComment(req, res) {
    console.log(req.body.comment);
    res.redirect('http://localhost:8080/cash-advance')
  },
  send(req, res) {
    sendEmail({
      subject: 'Exploring Gmail API',
      text: 'Hello welcome to my blog',
      to: 'jonalyn.mobilla@mlhuillier.com',
      from: '"Jonalyn Mobilla"<jonalyn.mobilla@mlhuillier.com>',
      template: 'sample',
      context: {
        data: 'jonalyn.mobilla'
      },
      attachments: [{
        filename: 'sample.pdf',
        content: 'jonalyn mobilla',
        contentType: 'application/pdf'
      }]
    }).then(resp => {
      console.log(resp);
      res.send(resp)
    }).catch(err => {
      console.log(err);
      res.send(err)
    })
  },
  // async send(req, res) {
  //   try {

  //     let approved_url = 'http://localhost:8080/';

  //     // sendEmail({
  //     //   subject: 'Exploring Gmail API',
  //     //   text: 'Hello welcome to my blog',
  //     //   to: 'jonalyn.mobilla@gmail.com',
  //     //   from: '"Jonalyn Mobilla"<jonalyn.mobilla@mlhuillier.com>',
  //     //   html: `<div><h1>Hi, this is a test email from Node.js using Gmail API</h1>
  //     //             <a href=${approved_url} style='text-decoration-line:none;color:white'>
  //     //               <button style='background-color:green';>Approve</button>
  //     //             </a>
  //     //             <button style='background-color:red'>Deny</button>
  //     //           </div>`
  //     // })
  //     await sendEmail({
  //       subject: 'Exploring Gmail API',
  //       text: 'Hello welcome to my blog',
  //       to: 'jonalyn.mobilla@gmail.com',
  //       from: '"Jonalyn Mobilla"<jonalyn.mobilla@mlhuillier.com>',
  //       template:"buttons"
  //     })
  //     console.log('success');
  //     res.send('success')
  //   } catch (error) {
  //     console.log('ERROR', error);
  //     res.send({ ERROR: error });
  //   }
  // },
  testing(req, res) {
    try {
      let approvedTemplate = fs.readFileSync(path.join(__dirname, '..', 'views', 'templates', 'rfApproved_pdf.hbs'), 'utf-8');

      let context = {
        name: 'Jonalyn'

      }
      let template = handlebars.compile(approvedTemplate);

      let DOC = template(context);

      console.log(DOC);

      _createPdfStream(DOC).then((stream) => {
        _streamToBuffer(stream, function (err, buffer) {
          if (err) {
            throw new Error(err);
          }
          let namePDF = "Control No";
          res.setHeader('Content-disposition', "inline; filename*=UTF-8''" + namePDF);
          res.setHeader('Content-type', 'application/pdf');
          console.log(buffer);
          return res.send(buffer);
        });
      });
    } catch (error) {
      console.log('error', error);
      res.json({ err: error });
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
    } else if (rows.type === 'Vpo') {
      console.log(rows);
    }
  },

  rfRequestFlow(req, res) {
    try {

      let controlNo = req.params.controlNo;
      let approver = req.params.approver;
      let comment = req.body.comment;

      // IF APPROVE IS CLICKED
      if (req.body.approved) {
        branchdbConnection.query(query.getRfRequestByControlNo, (controlNo), (err, request, fields) => {
          if (!err) {
            if (!request.length == 0) {
              console.log(request.length);
              if (request[0].request_status === 'pending') {
                console.log(request[0].request_status);
                if (approver === 'am_approver') {
                  console.log(approver);
                  if (request[0].am_status === '') {
                    console.log(request[0].am_status);
                    updateRfApproverStatus(res, 'approved', controlNo, 'rm_approver', 'am_status', request[0].rm_approver, request[0].am_fullname, request[0].rm_fullname, comment)
                  } else {
                    res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  }
                } else if (approver === 'rm_approver') {
                  if (request[0].rm_status === '') {
                    updateRfApproverStatus(res, 'approved', controlNo, 'ram_approver', 'rm_status', request[0].ram_approver, request[0].rm_fullname, request[0].ram_fullname, comment)
                  }
                  else {
                    res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  }
                } else if (approver === 'ram_approver') {
                  if (request[0].ram_status === '') {
                    updateRfApproverStatus(res, 'approved', controlNo, 'ass_approver', 'ram_status', request[0].ass_vpo_approver, request[0].ram_fullname, request[0].ass_fullname, comment)
                  } else {
                    res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  }
                } else if (approver === 'ass_approver') {
                  if (request[0].ass_status === '') {
                    updateRfApproverStatus(res, 'approved', controlNo, 'vpo_approver', 'ass_status', request[0].vpo_approver, request[0].ass_fullname, request[0].vpo_fullname, comment)
                  } else {
                    res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  }
                } else if (approver === 'vpo_approver') {
                  if (request[0].vpo_status === '') {
                    updateRfApproverStatus(res, 'approved', controlNo, 'vpo_approver', 'vpo_status', request[0].email, request[0].vpo_fullname, '', comment)
                  } else {
                    res.redirect(`http://localhost:8080/alert/${controlNo}`);
                  }
                }

              } else {
                if (approver === 'am_approver') {
                  res.redirect(`http://localhost:8080/alert/${controlNo}`);;
                } else if (approver === 'regional_approver') {
                  res.redirect(`http://localhost:8080/alert/${controlNo}`);
                } else if (approver === 'ram_approver') {
                  res.redirect(`http://localhost:8080/alert/${controlNo}`);
                } else if (approver === 'ass_approver') {
                  res.redirect(`http://localhost:8080/alert/${controlNo}`);
                } else if (approver === 'vpo_approver') {
                  res.redirect(`http://localhost:8080/alert/${controlNo}`);
                }
              }
            }
          }
          else {
            res.send({ err })
            console.log(err);
          }
        })
        // IF DISAPPROVE IS CLICKED
      } else if (req.body.disapproved) {
        branchdbConnection.query(query.getRfRequestByControlNo, (controlNo), (err, request, fields) => {
          if (!err) {
            console.log('Disapproved', request);
            if (!request.length == 0) {
              if (request[0].request_status === "pending") {
                if (req.body.comment) {
                  if (approver === 'am_approver') {
                    if (request[0].am_status === '') {
                      updateRfApproverStatus(res, 'disapproved', controlNo, 'rm_approver', 'am_status', request[0].rm_approver, request[0].am_fullname, request[0].rm_fullname, comment)
                    } else {
                      res.redirect(`http://localhost:8080/alert/${controlNo}`);
                    }
                  } else if (approver === 'rm_approver') {
                    if (request[0].rm_status === '') {
                      updateRfApproverStatus(res, 'disapproved', controlNo, 'ram_approver', 'rm_status', request[0].ram_approver, request[0].rm_fullname, request[0].ram_fullname, comment)
                    }
                    else {
                      res.redirect(`http://localhost:8080/alert/${controlNo}`);
                    }
                  } else if (approver === 'ram_approver') {
                    if (request[0].ram_status === '') {
                      updateRfApproverStatus(res, 'disapproved', controlNo, 'ass_approver', 'ram_status', request[0].ass_vpo_approver, request[0].ram_fullname, request[0].ass_fullname, comment)
                    } else {
                      res.redirect(`http://localhost:8080/alert/${controlNo}`);
                    }
                  } else if (approver === 'ass_approver') {
                    if (request[0].ass_status === '') {
                      updateRfApproverStatus(res, 'disapproved', controlNo, 'vpo_approver', 'ass_status', request[0].vpo_approver, request[0].ass_fullname, request[0].vpo_fullname, comment)
                    } else {
                      res.redirect(`http://localhost:8080/alert/${controlNo}`);
                    }
                  } else if (approver === 'vpo_approver') {
                    if (request[0].vpo_status === '') {
                      updateRfApproverStatus(res, 'disapproved', controlNo, 'vpo_approver', 'vpo_status', request[0].email, request[0].vpo_fullname, '', comment)
                    } else {
                      res.redirect(`http://localhost:8080/alert/${controlNo}`);
                    }
                  }

                } else {
                  res.redirect(`http://localhost:8080/alert-comment/${controlNo}`);
                }
              } else {
                if (approver === 'am_approver') {
                  res.redirect(`http://localhost:8080/alert/${controlNo}`);
                } else if (approver === 'rm_approver') {
                  res.redirect(`http://localhost:8080/alert/${controlNo}`);
                } else if (approver === 'ram_approver') {
                  res.redirect(`http://localhost:8080/alert/${controlNo}`);
                } else if (approver === 'ass_approver') {
                  res.redirect(`http://localhost:8080/alert/${controlNo}`);
                } else if (approver === 'vpo_approver') {
                  res.redirect(`http://localhost:8080/alert/${controlNo}`);
                }
              }
            }
            else {
              console.log('no data found', request);
            }
          }
          else {
            console.log(err);
          }
        })
      }
    } catch (error) {
      console.log('rfRequestFlow', error);
    }
  }
}