const winston = require('winston');
const format = winston.format;

const { PapertrailConnection, PapertrailTransport } = require('winston-papertrail');

const config = require('./app/config/config');
require('winston-papertrail').Papertrail;

  var winstonPapertrail = new winston.transports.Papertrail({
	host: config.logger.papertrailHost,
    port: config.logger.papertrailPort,
    colorize : true, 
    inlineMeta : true,
    level: 'debug', 
    program : config.appName + "(" + config.env + ")", 
    logFormat : function (level, message) {
        return level + ' ' + message;
      }
  })
  
  winstonPapertrail.on('error', function(err) {
	// Handle, report, or silently ignore connection errors and failures
  });

const logger = new winston.Logger({
  level: 'debug',
  transports: [
    new winston.transports.Console(),
    winstonPapertrail
  ]
});

module.exports = logger;