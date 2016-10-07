/* global describe, it, expect */

var $require = require('proxyquire');
var factory = require('..');
var expect = require('chai').expect;
var sinon = require('sinon');


describe('fingro-mx', function() {
  
  it('should export function', function() {
    expect(factory).to.be.an('function');
  });
  
  describe('resolveServices', function() {
    
    describe('without type, resolving to google.com', function() {
      var resolve = sinon.stub().yields(null, [
        { exchange: 'aspmx.l.google.com', priority: 1 },
        { exchange: 'aspmx2.googlemail.com', priority: 10 },
        { exchange: 'aspmx3.googlemail.com', priority: 10 },
        { exchange: 'alt1.aspmx.l.google.com', priority: 5 },
        { exchange: 'alt2.aspmx.l.google.com', priority: 5 }
      ]);
      
      
      var services;
      before(function(done) {
        var resolver = $require('..', { dns: { resolve: resolve } })();
        
        resolver.resolveServices('acct:jared@auth0.com', function(err, s) {
          if (err) { return done(err); }
          services = s;
          done();
        })
      });
      
      it('should call dns.resolve', function() {
        expect(resolve).to.have.been.calledOnce;
        expect(resolve).to.have.been.calledWith(
          'auth0.com', 'MX'
        );
      });
      
      it('should yeild services', function() {
        expect(services).to.be.an('object');
        expect(Object.keys(services)).to.have.length(3);
        expect(services['oauth2-authorize']).to.deep.equal([
          { location: 'https://accounts.google.com/o/oauth2/v2/auth' }
        ]);
        expect(services['oauth2-token']).to.deep.equal([
          { location: 'https://www.googleapis.com/oauth2/v4/token' }
        ]);
        expect(services['http://openid.net/specs/connect/1.0/issuer']).to.deep.equal([
          { location: 'https://accounts.google.com' }
        ]);
      });
    });
    
  });
  
});
