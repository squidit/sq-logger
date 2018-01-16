import describe from 'ava'
import sinon from 'sinon'
import oldLogger from '../src/to-be-deleted'

const replyMock = function (data) {
  return {
    code: (code) => ({ code, data })
  }
}

describe('Should return 200 status code with data', (assert) => {
  const response = oldLogger.sqReply({}, replyMock)('test data')
  assert.deepEqual(response.code, 200)
  assert.deepEqual(response.data, 'test data')
})

describe('Should return 202 status code with data', (assert) => {
  const response = oldLogger.sqReply({}, replyMock, 202)('test data')
  assert.deepEqual(response.code, 202)
  assert.deepEqual(response.data, 'test data')
})


describe('Should log to console and return internal error 500', (assert) => {
  const consoleSpy = sinon.spy()
  const oldConsole = process.stdout.write
  process.stdout.write = consoleSpy

  const response = oldLogger.sqReplyError({}, replyMock)('test data')

  process.stdout.write = oldConsole
  assert.deepEqual(response.code, 500)
  assert.true(consoleSpy.called)
  assert.true(consoleSpy.calledWith('test data\n'))
  assert.deepEqual(response.data, require('boom').internal())
})
