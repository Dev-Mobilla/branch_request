const log4js = require('log4js');
const dateInstance = new Date();
const date = dateInstance.getFullYear().toString()+(dateInstance.getUTCMonth() + 1).toString()+dateInstance.getUTCDate().toString();

log4js.configure(
    {
        appenders: {
            logAppenderInfo:{
                type:'dateFile',
                filename: `C:\\ca_rf_logs\\CA_RFLOGS_${date}.log`,
                layout:{
                    type: 'pattern',
                    pattern: '%p %d %X{context} %m',
                }
            },
            logAppenderError:{
                type:'dateFile',
                filename: `C:\\ca_rf_logs\\CA_RFLOGS_${date}.log`,
                layout:{
                    type: 'pattern',
                    pattern: '%p %d %X{context} %m',
                }
            },
            logAppenderFatal:{
                type:'dateFile',
                filename: `C:\\ca_rf_logs\\CA_RFLOGS_${date}.log`,
                layout:{
                    type: 'pattern',
                    pattern: '%p %d %X{context} %m',
                }
            }
        },
        categories:{
            default:{
                appenders:['logAppenderInfo'],
                level: 'info'
            },
            error:{
                appenders:['logAppenderError'],
                level: 'error'
            },
            fatal:{
                appenders:['logAppenderFatal'],
                level: 'fatal'
            }
        }
    }
)

const loggerInfo = log4js.getLogger();
const loggerError = log4js.getLogger('error');
const loggerFatal = log4js.getLogger('fatal');
module.exports = {loggerInfo, loggerError, loggerFatal};