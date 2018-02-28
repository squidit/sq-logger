const boom = require('boom')
const concat = require('lodash/concat')
const get = require('lodash/get')
const isArray = require('lodash/isArray')
const isEqual = require('lodash/isEqual')
const isEmpty = require('lodash/isEmpty')
const gt = require('lodash/gt')
const map = require('lodash/map')
const path = require('path')
const readJson = require('read-package-json')
const some = require('lodash/some')
const toLower = require('lodash/toLower')
const winston = require('winston')

const {
  LOGGER_TOKEN: token,
  NODE_ENV: env,
  LOGGER_LEVEL: loggerLevel
} = process.env

function getLoggerLevel () {
  return isEmpty(loggerLevel) ? 'error' : loggerLevel
}

function addProductionTransport () {
  if (isEmpty(token)) {
    console.info('LOGGER_TOKEN not informed and is production environment, loggin in daily file.')
    addStageTransport()
  } else {
    removeConsoleTransport()
    addLogEntriesTransport(token, getLoggerLevel())
  }
}

function addDevelopmentTransport () {
  removeConsoleTransport()
  addLogFileTransport()
}

function addStageTransport () {
  addDailyLogFileTransport()
}

function addTestTransport () {
  winston.remove(winston.transports.Console)
}

function dummyAdd () {
  return
}

function addConsoleTransport() {
  winston.add(winston.transports.Console)
}

function removeConsoleTransport() {
  winston.remove(winston.transports.Console)
}

function addLogEntriesTransport(token, loggerLevel) {
  require('le_node')
  winston.add(winston.transports.Logentries, {
    token,
    level: loggerLevel
  })
}

function removeLogEntriesTransport() {
  winston.remove(winston.transports.Logentries)
}

function addDailyLogFileTransport() {
  require('winston-daily-rotate-file')
  winston.add(winston.transports.DailyRotateFile, {
    filename: path.join(process.cwd(), 'all-logs.log'),
    datePattern: 'yyyy-MM-dd.',
    prepend: true,
    level: getLoggerLevel()
  })

  winston.handleExceptions(winston.transports.DailyRotateFile, {
    filename: path.join(process.cwd(), 'exceptions.log'),
    datePattern: 'yyyy-MM-dd.',
    prepend: true,
    level: getLoggerLevel()
  })
}

function removeDailyLogFileTransport() {
  winston.add(winston.transports.DailyRotateFile)
}

function addLogFileTransport() {
  winston.add(winston.transports.File, {
    filename: path.join(process.cwd(), 'all-logs.log'),
    level: getLoggerLevel()
  })

  winston.handleExceptions(winston.transports.File, {
    filename: path.join(process.cwd(), 'exceptions.log')
  })
}

function removeLogFileTransport() {
  winston.remove(winston.transports.File)
}

(() => {
  try {
    isEqual(env, 'production') ? addProductionTransport() : dummyAdd()
    isEqual(env, 'local') ||
    isEqual(env, 'develop') ||
    isEqual(env, 'develop') ||
    isEqual(env, 'development')
      ? addDevelopmentTransport()
      : dummyAdd()
    isEqual(env, 'stage') ? addStageTransport() : dummyAdd()
    isEqual(env, 'test') ? addTestTransport() : dummyAdd()

    return winston
  } catch (error) {
    console.info('Error to adding transports')
    console.error(error)
  }
})()

let pkg = {}

readJson(path.join(process.cwd(), 'package.json'), console.error, false, (error, data) => {
  if (error) {
    console.error(error)
  } else {
    pkg = data
  }
})

let expectedErrors = []

function mapErrors (errorsClasses) {
  expectedErrors = concat(expectedErrors, map(errorsClasses, error => toLower(error.name)))
  return null
}

function register (errorsClasses) {
  return (isArray(errorsClasses) && !isEmpty(errorsClasses)) ? mapErrors(errorsClasses) :
    null
}

function createErrorLogObj (request, error, boomError) {
  return {
    api: get(pkg, 'name'),
    version: get(pkg, 'version'),
    channel: get(request, 'headers.app_id', get(request, 'headers.x-sq-channel', '')),
    user_id: get(request, 'auth.credentials.sub', 'anonymous'),
    email: get(request, 'auth.credentials.email'),
    error_message: get(error, 'message'),
    method: get(request, 'route.method'),
    path: get(request, 'url.pathname'),
    query_string: get(request, 'query'),
    url_search: get(request, 'url.search'),
    payload: get(request, 'payload'),
    remote_address: get(request, 'info.remoteAddress'),
    request_id: get(request, 'id'),
    status_code: get(boomError, 'output.statusCode'),
    uid: get(request, 'headers.x-sq-uid', get(request, 'id')),
    user_agent: get(request, 'headers.user-agent'),
    stack: get(error, 'stack')
  }
}

function createInfoLogObj (request, statusCode) {
  return {
    api: get(pkg, 'name'),
    version: get(pkg, 'version'),
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
    uid: get(request, 'headers.x-sq-uid', get(request, 'id')),
    user_agent: get(request, 'headers.user-agent'),

    requestid: get(request, 'squid.requestid'),
    request_begin: get(request, 'squid.requestBegin'),
    request_end: get(request, 'squid.requestEnd'),
    request_duration: get(request, 'squid.requestDuration')
  }
}

function wrapError (request, error) {
  const isRegisteredError = some(expectedErrors, expectedError => isEqual(expectedError, toLower(error.constructor.name)))
  const errorToCreate = new Error(get(error, 'message'))
  return isRegisteredError
    ? boom.badRequest(errorToCreate)
    : boom.wrap(errorToCreate, (gt(error.statusCode, 300) ? error.statusCode : 500))
};

function logError (request, error) {
  const wrappedError = wrapError(request, error)
  const level = isEqual(get(wrappedError, 'output.statusCode'), 500) ? 'error' : 'warn'
  winston[level](JSON.stringify(createErrorLogObj(request, error, wrappedError)))
  return wrappedError
}

function logInfo (request, data, statusCode) {
  const logObj = createInfoLogObj(request, statusCode)
  winston.info(JSON.stringify(logObj))
  return data
}

function logStepError (step, err, data) {
  const log = Object.assign({}, {
    project: get(pkg, 'name'),
    version: get(pkg, 'version'),
    step,
    error: {
      message: get(err, 'message', ''),
      stack: get(err, 'stack', ''),
      name: get(err, 'name')
    }
  }, data)

  winston.error(JSON.stringify(log))
}

function logStepInfo (step, status, data) {
  const log = Object.assign({}, {
    project: get(pkg, 'name'),
    version: get(pkg, 'version'),
    step,
    status
  }, data)
  winston.info(JSON.stringify(log))
}

module.exports = winston
module.exports.createErrorLogObj = createErrorLogObj
module.exports.createInfoLogObj = createInfoLogObj
module.exports.getExpectedErrors = () => { return expectedErrors }
module.exports.logError = logError
module.exports.logInfo = logInfo
module.exports.logStepError = logStepError
module.exports.logStepInfo = logStepInfo
module.exports.logger = winston
module.exports.register = register
module.exports.wrapBoomError = wrapError

module.exports.addConsoleTransport = addConsoleTransport
module.exports.removeConsoleTransport = removeConsoleTransport
module.exports.addLogEntriesTransport = addLogEntriesTransport
module.exports.removeLogEntriesTransport = removeLogEntriesTransport
module.exports.addDailyLogFileTransport = addDailyLogFileTransport
module.exports.removeDailyLogFileTransport = removeDailyLogFileTransport
module.exports.addLogFileTransport = addLogFileTransport
module.exports.removeLogFileTransport = removeLogFileTransport
