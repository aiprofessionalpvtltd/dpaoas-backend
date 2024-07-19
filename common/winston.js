const { createLogger, format, transports } = require('winston')
const appRoot = require('app-root-path')

const options = {
  file: {
    level: 'info',
    filename: `${appRoot}/logs/app.log`,
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 3,
    colorize: false,
  },
  console: {
    filename: `${appRoot}/logs/debug.log`,
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
  error: {
    filename: `${appRoot}/logs/error.log`,
    level: 'error',
    colorize: true,
  },
}

// instantiate a new Winston Logger with the settings defined above
const colorize = format.colorize()
const logger = createLogger({
  transports: [
    new transports.File(options.file),
    new transports.Console(options.console),
    new transports.File(options.error),
  ],
  format: format.combine(
    format.simple(),
    format.timestamp({
      format: 'MMM-DD-YYYY HH:mm:ss',
    }),
    format.align(),
    format.printf((info) =>
      colorize.colorize(
        info.level,
        `[${info.level}]: ${[info.timestamp]}: ${info.message}`,
      ),
    ),
  ),
  exitOnError: false, // do not exit on handled exceptions
})

logger.level = 3
logger.info('Server Logger has been started Successfully')

module.exports = logger
