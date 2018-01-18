const LogEntries = require('le_node')
const rootPath = require('./utils/findMetadata')
const path = require('path')

/**
 * @typedef {('info'|'debug'|'warning'|'err'|'crit'|'alert'|'notice'|'emerg')} logLevels
 */
/**
 * @typedef {object} messageOptions
 * @property {logLevels} level Nível do log
 * @property {any!} message Mensagem do log
 */
class Logger {

  /**
   * Construtor da classe
   *
   * @param {string!} token Token do LogEntries
   */
  constructor (token) {
    // Tratamento básico de erro porque se não a classe iria travar a aplicação
    if (!token) throw new Error('Logger should have a token')
    // Pega a variável de ambiente para desenvolvimento que será usada no debug
    this._isDev = (process.env.NODE_ENV !== 'production') || false
    this._mountPackageInfo()
    // Lista de logs disponíveis do Log Entries para não dar erro na função "log"
    this._levels = ['info', 'debug', 'warning', 'err', 'crit', 'alert', 'notice', 'emerg']
    this._logEntries = new LogEntries({token: token})
  }

  /**
   * Monta as informações internas do pacote
   * @private
   * @return void
   */
  _mountPackageInfo () {
    /* istanbul ignore next */
    this._packageName = require(path.join(rootPath, 'package.json')).name || 'Unknown package'
    /* istanbul ignore next */
    this._packageVersion = require(path.join(rootPath, 'package.json')).version || '0.0.0'
  }

  /**
   * Seta o nome do pacote do usuário que será usado no log
   *
   * @public
   * @param {string} name Nome do pacote
   */
  set packageName (name) {
    this._packageName = name
  }

  /**
   * Seta a versão do pacote do usuário que será usado no log
   *
   * @public
   * @param {string} version Versão do pacote
   */
  set packageVersion (version) {
    this._packageVersion = version
  }

  /**
   * Retorna o nome do pacote do usuário que será usado no log
   *
   * @public
   * @return {string} Nome do pacote
   */
  get packageName () {
    return this._packageName
  }

  /**
   * Retorna a versão do pacote do usuário que será usado no log
   *
   * @public
   * @return {string} Versão do pacote
   */
  get packageVersion () {
    return this._packageVersion
  }

  /**
   * Loga uma mensagem de informação
   * @param {any!} message Mensagem do log
   * @public
   */
  info (message) {
    return this._logMessage({level: 'info', message: message})
  }

  /**
   * Loga uma mensagem de aviso
   * @param {any!} message Mensagem do log
   * @public
   */
  warning (message) {
    return this._logMessage({level: 'warning', message: message})
  }

  /**
   * Loga uma mensagem de erro
   * @param {any!} message Mensagem do log
   * @public
   */
  error (message) {
    return this._logMessage({level: 'err', message: message})
  }

  /**
   * Loga uma mensagem de erro com outro nível de log diferente dos definidos pelo sistema.
   *
   * @param {logLevels!} level Nível do log
   * @param {any!} message Mensagem do log
   */
  log (level, message) {
    if (!this._levels.includes(level)) throw new Error('Log level not valid, please refer to the "le_node" package documentation')
    return this._logMessage({level: level, message: message})
  }

  /**
   * Gera o objeto com o nome e a versão do pacote sendo logado e inclui no início de todas as mensagens
   * @return {object} Informações do pacote
   * @private
   */
  _generatePackageInfo () {
    return { app: this._packageName, version: this._packageVersion }
  }

  /**
   * Agrupa as informações da mensagem e do pacote em um único objeto
   * @param {number|string|object} message Mensagem a ser logada
   * @return {object} Mensagem completa do log
   * @private
   */
  _generateLogMessage (message) {
    return Object.assign({}, this._generatePackageInfo(), {message: message})
  }

  /**
   * Loga uma mensagem tanto no console para debug quanto para o Log Entries
   * @param {messageOptions} options Opções de mensagem, como nível de log e texto
   * @private
   * @return void
   */
  _logMessage (options) {
    this._logDebug(options)
    return this._logEntries.log(options.level, this._generateLogMessage(options.message))
  }

  /**
   * Loga uma mensagem de debug somente se a env NODE_ENV for 'dev' no console
   *
   * Isto vale para todos os logs.
   * @param {messageOptions} options Opções de mensagem, como nível, log e texto
   * @private
   * @return void
   */
  _logDebug (options) {
    if (this._isDev) {
      console.log(`[${new Date().toLocaleString()}] - {${options.level}} =>`, options.message)
    }
  }
}

module.exports = Logger
