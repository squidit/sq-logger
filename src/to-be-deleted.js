/**
 * Este módulo será deletado assim que houver a finalização do transporte de todos as APIs para o novo modelo
 *
 * Este arquivo só existe para as APIs não quebrarem com a nova versão do SQ-Logger
 */
function replyInfo (request, reply, statusCode = 200) {
  return (data) => reply(data).code(statusCode)
}

function replyError (request, reply) {
  return (error) => {
    console.log(error)
    return reply(require('boom').internal()).code(500)
  }
}

function replyEmpty (request, reply, statusCode = 200) {
  return () => reply(null).code(statusCode)
}

function logInfo (request, data, statusCode) {
  return data
}

function logStepError (step, err, data) {
  return data
}

function logStepInfo (step, status, data) {
  return data
}

function wrapError (request, error) {
  const boom = require('boom')

  const errorToCreate = new Error(error.message)
  return error.statusCode
    ? boom.wrap(errorToCreate, error.statusCode)
    : boom.wrap(errorToCreate, ((error.statusCode > 300) ? error.statusCode : 500))
}

function createErrorLogObj (request, error, boomError) {
  return {
    api: '',
    version: '0.0.0',
    channel: request.headers.app_id || request.headers['x-sq-channel'] || '',
    user_id: request.auth.credentials.sub || 'anonymous',
    email: request.auth.credentials.email,
    error_message: error.message,
    method: request.route.method,
    path: request.url.pathname,
    query_string: request.query,
    url_search: request.url.search,
    payload: request.payload,
    remote_address: request.info.remoteAddress,
    request_id: request.id,
    status_code: boomError.output.statusCode,
    uid: request.headers['x-sq-uid'] || request.id,
    user_agent: request.headers['user-agent'],
    stack: error.stack
  }
}

function createInfoLogObj (request, statusCode) {
  return {
    api: '',
    version: '0.0.0',
    channel: request.headers.app_id || request.headers['x-sq-channel'] || '',
    user_id: request.auth.credentials.sub || 'anonymous',
    email: request.auth.credentials.email,
    method: request.route.method,
    path: request.url.pathname,
    query_string: request.query,
    url_search: request.url.search,
    remote_address: request.info.remoteAddress,
    request_id: request.id,
    status_code: statusCode,
    uid: request.headers['x-sq-uid'] || request.id,
    user_agent: request.headers['user-agent']
  }
}

module.exports = {
  sqReply: replyInfo,
  sqReplyError: replyError,
  reply: replyInfo,
  replyError: replyError,
  handleError: replyError,
  defaultErrorHandler: replyError,
  replyEmpty: replyEmpty,
  sqReplyEmpty: replyEmpty,
  logInfo: logInfo,
  logError: (request, error) => wrapError(request, error),
  logStepError: logStepError,
  logStepInfo: logStepInfo,
  wrapBoomError: wrapError,
  register: () => null,
  getExpectedErrors: () => [],
  createErrorLogObj: createErrorLogObj,
  createInfoLogObj: createInfoLogObj,
  logger: require('winston')
}
