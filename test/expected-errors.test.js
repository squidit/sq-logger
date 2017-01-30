/* global describe, it */
require('chai').should()
const logger = require('../src/sq-logger')

describe('expected errors', () => {
  it('should register classes', () => {
    logger.getExpectedErrors().should.have.length(0)
    logger.register([Error])
    logger.getExpectedErrors().should.have.length(1)
  })

  it('should register classes in lower string', () => {
    logger.register([Error])
    logger.getExpectedErrors()[0].should.to.be.eql('error')
  })
})
