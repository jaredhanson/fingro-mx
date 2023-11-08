/* global describe, it, expect */

var $require = require('proxyquire');
var factory = require('..');
var expect = require('chai').expect;
var sinon = require('sinon');


describe('fingro-mx', function() {
  
  it('should export function', function() {
    expect(factory).to.be.an('function');
  });
  
  describe('resolve', function() {
    
    it('should yield record when called without type argument', function(done) {
      var resolve = sinon.stub().yields(null, [
        { exchange: 'aspmx.l.google.com', priority: 1 },
        { exchange: 'aspmx2.googlemail.com', priority: 10 },
        { exchange: 'aspmx3.googlemail.com', priority: 10 },
        { exchange: 'alt1.aspmx.l.google.com', priority: 5 },
        { exchange: 'alt2.aspmx.l.google.com', priority: 5 }
      ]);
      
      var resolver = $require('..', { dns: { resolve: resolve } })();
      resolver.resolve('acct:jared@auth0.com', function(err, record) {
        if (err) { return done(err); }
        
        expect(resolve).to.have.been.calledOnce;
        expect(resolve).to.have.been.calledWith(
          'auth0.com', 'MX'
        );
        expect(record).to.be.an('object');
        expect(record).to.deep.equal({
          services: {
            'oauth2-authorize': [
              { location: 'https://accounts.google.com/o/oauth2/v2/auth' }
            ],
            'oauth2-token': [
              { location: 'https://www.googleapis.com/oauth2/v4/token' }
            ],
            'http://openid.net/specs/connect/1.0/issuer': [
              { location: 'https://accounts.google.com' }
            ]
          }
        });
        done();
      });
    });
    
  }); // resolve
  
  describe('resolveServices', function() {
    
    it('should yield service when MX records resolve to google by default', function(done) {
      var resolve = sinon.stub().yields(null, [
        { exchange: 'aspmx.l.google.com', priority: 1 },
        { exchange: 'aspmx2.googlemail.com', priority: 10 },
        { exchange: 'aspmx3.googlemail.com', priority: 10 },
        { exchange: 'alt1.aspmx.l.google.com', priority: 5 },
        { exchange: 'alt2.aspmx.l.google.com', priority: 5 }
      ]);
      
      var resolver = $require('..', { dns: { resolve: resolve } })();
      resolver.resolveServices('acct:jared@auth0.com', 'oauth2-authorize', function(err, services) {
        if (err) { return done(err); }
        
        expect(resolve).to.have.been.calledOnce;
        expect(resolve).to.have.been.calledWith(
          'auth0.com', 'MX'
        );
        expect(services).to.be.an('array');
        expect(services).to.have.length(1);
        expect(services[0]).to.deep.equal({ location: 'https://accounts.google.com/o/oauth2/v2/auth' });
        done();
      });
    }); // should yield service when MX records resolve to google by default
    
    it('should yield all services when MX records resolve to google by default', function(done) {
      var resolve = sinon.stub().yields(null, [
        { exchange: 'aspmx.l.google.com', priority: 1 },
        { exchange: 'aspmx2.googlemail.com', priority: 10 },
        { exchange: 'aspmx3.googlemail.com', priority: 10 },
        { exchange: 'alt1.aspmx.l.google.com', priority: 5 },
        { exchange: 'alt2.aspmx.l.google.com', priority: 5 }
      ]);
      
      var resolver = $require('..', { dns: { resolve: resolve } })();
      resolver.resolveServices('acct:jared@auth0.com', function(err, services) {
        if (err) { return done(err); }
        
        expect(resolve).to.have.been.calledOnce;
        expect(resolve).to.have.been.calledWith(
          'auth0.com', 'MX'
        );
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
        done();
      });
    }); // should yield all services when MX records resolve to google by default
    
    it('should yield all services when MX records resolve to configured exchange', function(done) {
      var resolve = sinon.stub().yields(null, [
        { exchange: 'smtp.example.com', priority: 1 }
      ]);
      
      var exchanges = {
        'smtp.example.com': { 'http://openid.net/specs/connect/1.0/issuer': 'https://id.example.com' }
      };
      var resolver = $require('..', { dns: { resolve: resolve } })(exchanges);
      resolver.resolveServices('acct:alice@example.com', function(err, services) {
        if (err) { return done(err); }
        
        expect(resolve).to.have.been.calledOnce;
        expect(resolve).to.have.been.calledWith(
          'example.com', 'MX'
        );
        expect(services).to.be.an('object');
        expect(Object.keys(services)).to.have.length(1);
        expect(services['http://openid.net/specs/connect/1.0/issuer']).to.deep.equal([
          { location: 'https://id.example.com' }
        ]);
        done();
      });
    }); // should yield all services when MX records resolve to configured exchange
    
    it('should yield error when service is not available', function(done) {
      var resolve = sinon.stub().yields(null, [
        { exchange: 'aspmx.l.google.com', priority: 1 },
        { exchange: 'aspmx2.googlemail.com', priority: 10 },
        { exchange: 'aspmx3.googlemail.com', priority: 10 },
        { exchange: 'alt1.aspmx.l.google.com', priority: 5 },
        { exchange: 'alt2.aspmx.l.google.com', priority: 5 }
      ]);
      
      var resolver = $require('..', { dns: { resolve: resolve } })();
      resolver.resolveServices('acct:jared@auth0.com', 'foo-bar', function(err, services) {
        expect(err).to.be.an.instanceOf(Error);
        expect(err.message).to.equal('Service not found: foo-bar');
        expect(err.code).to.equal('ENODATA');
        expect(services).to.be.undefined;
        done();
      });
    }); // should yield error when service is not available
    
    describe('resolving to custom exchange to service map, using array of strings', function() {
      var resolve = sinon.stub().yields(null, [
        { exchange: 'mail.example.com', priority: 1 }
      ]);
      
      
      var services;
      before(function(done) {
        var exchanges = {
          'mail.example.com': { 'oauth2-authorize': [ 'https://www.example.com/oauth2/08/authorize', 'https://www.example.com/oauth2/00/authorize' ] }
        }
        
        
        var resolver = $require('..', { dns: { resolve: resolve } })(exchanges);
        
        resolver.resolveServices('acct:alice@example.com', function(err, s) {
          if (err) { return done(err); }
          services = s;
          done();
        })
      });
      
      it('should call dns.resolve', function() {
        expect(resolve).to.have.been.calledOnce;
        expect(resolve).to.have.been.calledWith(
          'example.com', 'MX'
        );
      });
      
      it('should yeild services', function() {
        expect(services).to.be.an('object');
        expect(Object.keys(services)).to.have.length(1);
        expect(services['oauth2-authorize']).to.deep.equal([
          { location: 'https://www.example.com/oauth2/08/authorize' },
          { location: 'https://www.example.com/oauth2/00/authorize' }
        ]);
      });
    });
    
    describe('resolving to custom exchange to service map, where an unknown higher priority exchange has been added', function() {
      var resolve = sinon.stub().yields(null, [
        { exchange: 'mail.example.com', priority: 10 },
        { exchange: 'smtp.example.com', priority: 1 }
      ]);
      
      
      var services;
      before(function(done) {
        var exchanges = {
          'mail.example.com': { 'http://openid.net/specs/connect/1.0/issuer': 'https://id.example.com' }
        }
        
        
        var resolver = $require('..', { dns: { resolve: resolve } })(exchanges);
        
        resolver.resolveServices('acct:alice@example.com', function(err, s) {
          if (err) { return done(err); }
          services = s;
          done();
        })
      });
      
      it('should call dns.resolve', function() {
        expect(resolve).to.have.been.calledOnce;
        expect(resolve).to.have.been.calledWith(
          'example.com', 'MX'
        );
      });
      
      it('should yeild services', function() {
        expect(services).to.be.an('object');
        expect(Object.keys(services)).to.have.length(1);
        expect(services['http://openid.net/specs/connect/1.0/issuer']).to.deep.equal([
          { location: 'https://id.example.com' }
        ]);
      });
    });
    
    describe('error due to unsupported identifier', function() {
      var error, services;
      before(function(done) {
        var resolver = factory();
        
        resolver.resolveServices('http://example.com/~joe', function(err, s) {
          error = err;
          services = s;
          done();
        })
      });
      
      it('should yield error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('Scheme not supported: http:');
        expect(error.code).to.equal('EIDNOSUPPORT');
      });
      
      it('should not yeild services', function() {
        expect(services).to.be.undefined;
      });
    });
    
    describe('error due to unknown exchnage', function() {
      var resolve = sinon.stub().yields(null, [
        { exchange: 'mail.unknown.com', priority: 1 },
      ]);
      
      
      var services, error;
      before(function(done) {
        var resolver = $require('..', { dns: { resolve: resolve } })();
        
        resolver.resolveServices('acct:john@unknown.com', function(err, s) {
          error = err;
          services = s;
          done();
        })
      });
      
      it('should call dns.resolve', function() {
        expect(resolve).to.have.been.calledOnce;
        expect(resolve).to.have.been.calledWith(
          'unknown.com', 'MX'
        );
      });
      
      it('should yield error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('Unknown exchange: unknown.com');
        expect(error.code).to.equal('EPROTONOSUPPORT');
      });
      
      it('should not yeild services', function() {
        expect(services).to.be.undefined;
      });
    });
    
    describe('error due to no MX records', function() {
      var ierr = new Error('queryMx ENODATA example.com');
      ierr.code = 'ENODATA';
      ierr.errno = 'ENODATA';
      ierr.syscall = 'queryMx';
      ierr.hostname = 'example.com';
      var resolve = sinon.stub().yields(ierr);
      
      
      var error, services;
      before(function(done) {
        var resolver = $require('..', { dns: { resolve: resolve } })();
        
        resolver.resolveServices('acct:joe@example.com', function(err, s) {
          error = err;
          services = s;
          done();
        })
      });
      
      it('should call dns.resolve', function() {
        expect(resolve).to.have.been.calledOnce;
        expect(resolve).to.have.been.calledWith(
          'example.com', 'MX'
        );
      });
      
      it('should yield error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('queryMx ENODATA example.com');
        expect(error.code).to.equal('ENODATA');
      });
      
      it('should not yeild services', function() {
        expect(services).to.be.undefined;
      });
    });
    
    describe('error due to no domain not found', function() {
      var ierr = new Error('queryMx ENOTFOUND asdfasdfasdfasdf33433.com');
      ierr.code = 'ENOTFOUND';
      ierr.errno = 'ENOTFOUND';
      ierr.syscall = 'queryMx';
      ierr.hostname = 'asdfasdfasdfasdf33433.com';
      var resolve = sinon.stub().yields(ierr);
      
      
      var error, services;
      before(function(done) {
        var resolver = $require('..', { dns: { resolve: resolve } })();
        
        resolver.resolveServices('acct:foo@asdfasdfasdfasdf33433.com', function(err, s) {
          error = err;
          services = s;
          done();
        })
      });
      
      it('should call dns.resolve', function() {
        expect(resolve).to.have.been.calledOnce;
        expect(resolve).to.have.been.calledWith(
          'asdfasdfasdfasdf33433.com', 'MX'
        );
      });
      
      it('should yield error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('queryMx ENOTFOUND asdfasdfasdfasdf33433.com');
        expect(error.code).to.equal('ENOTFOUND');
      });
      
      it('should not yeild services', function() {
        expect(services).to.be.undefined;
      });
    });
    
  }); // resolveServices
  
});
