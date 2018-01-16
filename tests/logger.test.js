import describe from 'ava'
import Logger from '../src/Logger'

describe.beforeEach((test) => {
  test.context.logger = new Logger('ae0ca3af-ce78-4a1b-8e96-6f87a1e153ef')
  test.context.token = 'ae0ca3af-ce78-4a1b-8e96-6f87a1e153ef'
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

describe('Should set correct NODE_ENV for dev', (assert) => {
  assert.true(assert.context.logger._isDev)
})
