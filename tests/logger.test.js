import describe from 'ava'
import metadata from '../package.json'
import sinon from 'sinon'
import Logger from '../src/Logger'
import findMeta from 'app-root-dir'

describe.beforeEach((test) => {
  test.context.logger = new Logger('ae0ca3af-ce78-4a1b-8e96-6f87a1e153ef')
  test.context.token = 'ae0ca3af-ce78-4a1b-8e96-6f87a1e153ef'
  test.context.logEntriesMock = {
    log: sinon.spy()
  }
})

describe('Should NOT allow empty token', (assert) => {
  assert.throws(() => {
    const log = new Logger('')
    log._isDev
  }, Error)
})

describe('Should get correct name and version for package', (assert) => {
  assert.deepEqual(assert.context.logger.packageName, require('../package.json').name)
  assert.deepEqual(assert.context.logger.packageVersion, require('../package.json').version)
})

describe('Should set correct name and version for package', (assert) => {
  assert.context.logger.packageName = 'test-package'
  assert.context.logger.packageVersion = '1.0.0'
  assert.deepEqual(assert.context.logger.packageName, 'test-package')
  assert.deepEqual(assert.context.logger.packageVersion, '1.0.0')
})

describe('Should generate correct package information', (assert) => {
  assert.deepEqual(assert.context.logger._generatePackageInfo(), { app: metadata.name, version: metadata.version })
})

describe('Should set debug to dev when NODE_ENV is not "production"', (assert) => {
  process.env.NODE_ENV = 'dev'
  assert.true(new Logger(assert.context.token)._isDev)
})

describe('Should set debug to production when NODE_ENV is "production"', (assert) => {
  process.env.NODE_ENV = 'production'
  assert.false(new Logger(assert.context.token)._isDev)
})

describe('Should generate correct log message', (assert) => {
  assert.deepEqual(assert.context.logger._generateLogMessage('test message'), { app: metadata.name, version: metadata.version, message: 'test message' })
})

describe('Should log to console when NODE_ENV is different from "production"', (assert) => {
  process.env.NODE_ENV = 'dev'
  const oldConsole = process.stdout.write // Salva o console antigo
  const consoleSpy = sinon.spy()
  process.stdout.write = consoleSpy // Remove o console para um spy

  const logger = new Logger(assert.context.token) // Instancia uma nova classe do logger para pegar o valor correto da node env
  const testObj = { level: 'info', message: 'test message' }

  assert.true(logger._isDev)
  logger._logDebug(testObj)
  assert.true(consoleSpy.called)
  assert.true(consoleSpy.args[0][0].indexOf(`{${testObj.level}} => ${testObj.message}`) > 0)

  process.stdout.write = oldConsole // Volta o console para o que era antes
})

describe('Should NOT log to console when NODE_ENV is "production"', (assert) => {
  process.env.NODE_ENV = 'production'
  const oldConsole = process.stdout.write // Salva o console antigo
  const consoleSpy = sinon.spy()
  process.stdout.write = consoleSpy // Remove o console para um spy

  const logger = new Logger(assert.context.token) // Instancia uma nova classe do logger para pegar o valor correto da node env
  const testObj = { level: 'info', message: 'test message' }

  assert.false(logger._isDev)
  logger._logDebug(testObj)
  assert.false(consoleSpy.called)
  assert.deepEqual(consoleSpy.args, [])

  process.stdout.write = oldConsole // Volta o console para o que era antes
})

describe('Should log info message to logEntries using internal method', (assert) => {
  assert.context.logger._logEntries = assert.context.logEntriesMock
  const testObj = { level: 'info', message: 'test message' }

  assert.context.logger._logMessage(testObj)

  assert.true(assert.context.logEntriesMock.log.called)
  assert.true(assert.context.logEntriesMock.log.calledWith(testObj.level, assert.context.logger._generateLogMessage(testObj.message)))
})

describe('Should log info message to logEntries using exposed method', (assert) => {
  assert.context.logger._logMessage = sinon.spy()
  const testMessage = 'test message'

  assert.context.logger.info(testMessage)
  assert.true(assert.context.logger._logMessage.called)
  assert.true(assert.context.logger._logMessage.calledWith({ level: 'info', message: testMessage }))
})

describe('Should log error message to logEntries using exposed method', (assert) => {
  assert.context.logger._logMessage = sinon.spy()
  const testMessage = 'test message'

  assert.context.logger.error(testMessage)
  assert.true(assert.context.logger._logMessage.called)
  assert.true(assert.context.logger._logMessage.calledWith({ level: 'err', message: testMessage }))
})

describe('Should log warning message to logEntries using exposed method', (assert) => {
  assert.context.logger._logMessage = sinon.spy()
  const testMessage = 'test message'

  assert.context.logger.warning(testMessage)
  assert.true(assert.context.logger._logMessage.called)
  assert.true(assert.context.logger._logMessage.calledWith({ level: 'warning', message: testMessage }))
})

describe('Should log message with custom level to logEntries using exposed method', (assert) => {
  assert.context.logger._logMessage = sinon.spy()

  assert.context.logger.log('crit', 'test message')
  assert.true(assert.context.logger._logMessage.called)
  assert.true(assert.context.logger._logMessage.calledWith({ level: 'crit', message: 'test message' }))
})

describe('Should NOT log message with custom level to logEntries using exposed method when level does not exist on list', (assert) => {
  assert.context.logger._logMessage = sinon.spy()

  assert.throws(() => assert.context.logger.log('notExists', 'test message'), Error)
  assert.false(assert.context.logger._logMessage.called)
})
