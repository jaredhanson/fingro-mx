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
    
    describe('resolving to google.com', function() {
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
    
    describe('resolving to google.com, with type', function() {
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
        
        resolver.resolveServices('acct:jared@auth0.com', 'oauth2-authorize', function(err, s) {
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
        expect(services).to.be.an('array');
        expect(Object.keys(services)).to.have.length(1);
        expect(services[0]).to.deep.equal({ location: 'https://accounts.google.com/o/oauth2/v2/auth' });
      });
    });
    
    describe('resolving to google.com, with type not found', function() {
      var resolve = sinon.stub().yields(null, [
        { exchange: 'aspmx.l.google.com', priority: 1 },
        { exchange: 'aspmx2.googlemail.com', priority: 10 },
        { exchange: 'aspmx3.googlemail.com', priority: 10 },
        { exchange: 'alt1.aspmx.l.google.com', priority: 5 },
        { exchange: 'alt2.aspmx.l.google.com', priority: 5 }
      ]);
      
      
      var services, error;
      before(function(done) {
        var resolver = $require('..', { dns: { resolve: resolve } })();
        
        resolver.resolveServices('acct:jared@auth0.com', 'foo-bar', function(err, s) {
          error = err;
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
      
      it('should yield error', function() {
        expect(error).to.be.an.instanceOf(Error);
        expect(error.message).to.equal('Service not found: foo-bar');
        expect(error.code).to.equal('ENODATA');
      });
      
      it('should not yeild services', function() {
        expect(services).to.be.undefined;
      });
    });
    
    describe('resolving to custom exchange to service map, using string', function() {
      var resolve = sinon.stub().yields(null, [
        { exchange: 'mail.example.com', priority: 1 }
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
        expect(error.code).to.equal('ENOSUPPORT');
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
    
  });
  
});
