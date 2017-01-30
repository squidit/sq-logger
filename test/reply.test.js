/* global describe, it */
require('chai').should()
const sinon = require('sinon')
const logger = require('../src/sq-logger')

describe('reply', () => {
  it('should reply with log info', () => {
    const logInfo = sinon.stub(logger, 'logInfo')
    const reply = sinon.stub().returns({
      code (statusCode) {
        return statusCode
      }
    })

    const statusCode = logger.reply({}, reply)({})

    sinon.assert.calledOnce(logInfo)
    sinon.assert.calledOnce(reply)
    logInfo.restore()
    statusCode.should.to.be.eql(200)
  })

  it('should reply with log error', () => {
    const logError = sinon.stub(logger, 'logError')
    const reply = sinon.stub().returns({})

    logger.replyError({}, reply)({})

    sinon.assert.calledOnce(logError)
    sinon.assert.calledOnce(reply)
    logError.restore()
  })
})
