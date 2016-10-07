/* global describe, it, expect */

var factory = require('..');
var expect = require('chai').expect;


describe('fingro-mx', function() {
  
  it('should export function', function() {
    expect(factory).to.be.an('function');
  });
  
});
