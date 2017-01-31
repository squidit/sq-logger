require('pkginfo')(module, 'version', 'name')
const boom = require('boom')
const concat = require('lodash/concat')
const get = require('lodash/get')
const isArray = require('lodash/isArray')
const isEqual = require('lodash/isEqual')
const isEmpty = require('lodash/isEmpty')
const map = require('lodash/map')
const path = require('path')
const some = require('lodash/some')
const toLower = require('lodash/toLower')
const winston = require('winston')

const {
  LOGGER_TOKEN: token,
  NODE_ENV: env
} = process.env

function addProductionTransport () {
  if (isEmpty(token)) {
    console.info('LOGGER_TOKEN not informed and is production environment, loggin in daily file.')
    addStageTransport()
  } else {
    require('le_node')
    winston.add(winston.transports.Logentries, { token })
    winston.handleExceptions(winston.transports.Logentries)
  }
}

function addDevelopmentTransport () {
  winston.add(winston.transports.File, { filename: path.join(__dirname, 'all-logs.log') })
  winston.handleExceptions(winston.transports.File, { filename: path.join(__dirname, 'exceptions.log') })
}

function addStageTransport () {
  require('winston-daily-rotate-file')
  winston.add(winston.transports.DailyRotateFile, {
    filename: './all-logs.log',
    datePattern: 'yyyy-MM-dd.',
    prepend: true,
    level: 'debug'
  })
  winston.handleExceptions(winston.transports.DailyRotateFile, {
    filename: './exceptions.log',
    datePattern: 'yyyy-MM-dd.',
    prepend: true,
    level: 'debug'
  })
}

function dummyAdd () { return }

(() => {
  try {
    isEqual(env, 'production') ? addProductionTransport() : dummyAdd()
    isEqual(env, 'development') ? addDevelopmentTransport() : dummyAdd()
    isEqual(env, 'stage') ? addStageTransport() : dummyAdd()

    return winston
  } catch (error) {
    console.info('Error to adding transports')
    console.error(error)
  }
})()

let expectedErrors = []

function mapErrors (errorsClasses) {
  expectedErrors = concat(expectedErrors, map(errorsClasses, error => toLower(error.name)))
  return null
}

function register (errorsClasses) {
  return (isArray(errorsClasses) && !isEmpty(errorsClasses)) ? mapErrors(errorsClasses)
    : null
}

function createErrorLogObj (request, error, boomError) {
  return {
    api: get(module, 'exports.name'),
    version: get(module, 'exports.version'),
    channel: get(request, 'headers.app_id', get(request, 'headers.x-sq-channel', '')),
    user_id: get(request, 'auth.credentials.sub', 'anonymous'),
    email: get(request, 'auth.credentials.email'),
    error_message: get(error, 'message'),
    error,
    method: get(request, 'route.method'),
    path: get(request, 'url.pathname'),
    query_string: get(request, 'query'),
    url_search: get(request, 'url.search'),
    payload: get(request, 'payload'),
    remote_address: get(request, 'info.remoteAddress'),
    request_id: get(request, 'id'),
    status_code: get(boomError, 'statusCode'),
    uid: get(request, 'headers.x-sq-uid')
  }
}

function createInfoLogObj (request, statusCode) {
  return {
    api: get(module, 'exports.name'),
    version: get(module, 'exports.version'),
    channel: get(request, 'headers.app_id', get(request, 'headers.x-sq-channel', '')),
    user_id: get(request, 'auth.credentials.sub', 'anonymous'),
    email: get(request, 'auth.credentials.email'),
    method: get(request, 'route.method'),
    path: get(request, 'url.pathname'),
    query_string: get(request, 'query'),
    url_search: get(request, 'url.search'),
    remote_address: get(request, 'info.remoteAddress'),
    request_id: get(request, 'id'),
    status_code: statusCode,
    uid: get(request, 'headers.x-sq-uid')
  }
}

function wrapError (request, error) {
  const isRegisteredError = some(expectedErrors, toLower(get(error, 'name', '')))
  return isRegisteredError ? boom.badRequest(error) : boom.wrap(error)
};

function logError (request, error) {
  const wrappedError = wrapError(request, error)
  const level = isEqual(wrappedError.statusCode, 500) ? 'error' : 'warn'
  winston.log(level, JSON.stringify(createErrorLogObj(request, error, wrappedError)))
  return wrappedError
}

function replyError (request, reply) {
  return (error) => reply(logError(request, error))
}

function logInfo (request, data, statusCode) {
  const logObj = createInfoLogObj(request, statusCode)
  winston.log('info', JSON.stringify(logObj))
  return data
}

function replyInfo (request, reply, statusCode = 200) {
  return (data) => reply(logInfo(request, data, statusCode)).code(statusCode)
}

module.exports = winston
module.exports.createErrorLogObj = createErrorLogObj
module.exports.createInfoLogObj = createInfoLogObj
module.exports.getExpectedErrors = () => { return expectedErrors }
module.exports.handleError = replyError
module.exports.defaultErrorHandler = replyError
module.exports.logError = logError
module.exports.logInfo = logInfo
module.exports.logger = winston
module.exports.register = register
module.exports.replyError = replyError
module.exports.reply = replyInfo
module.exports.sqReply = replyInfo
module.exports.sqReplyError = replyError
module.exports.wrapBoomError = wrapError
