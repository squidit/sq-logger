/**
 * Este módulo será deletado assim que houver a finalização do transporte de todos as APIs para o novo modelo
 *
 * Este arquivo só existe para as APIs não quebrarem com a nova versão do SQ-Logger
 */
module.exports = {
  sqReply: function replyInfo (request, reply, statusCode = 200) {
    return (data) => reply(data).code(statusCode)
  },
  sqReplyError: function replyError (request, reply) {
    return (error) => {
      require('./logger').error(error.message)
      return reply(require('boom').internal()).code(500)
    }
  }
}
