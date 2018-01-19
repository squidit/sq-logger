import describe from 'ava'
import index from '../index'

describe('Should return Logger object in separate property', (assert) => {
  assert.deepEqual(index.Logger, require('../src/Logger'))
  assert.deepEqual(index.sqReply, require('../src/to-be-deleted').sqReply)
  assert.deepEqual(index.sqReplyError, require('../src/to-be-deleted').sqReplyError)
})
