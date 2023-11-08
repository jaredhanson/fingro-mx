var uri = require('url')
  , dns = require('dns')
  , BadNameError = require('./errors/badnameerror')
  , ProtocolNotSupportedError = require('./errors/protocolnotsupportederror')
  , NoDataError = require('./errors/nodataerror');

var DEFAULT_PROVIDERS = [ 'google' ];

function Resolver(exchanges) {
  this._exchanges = exchanges;
}

Resolver.prototype.resolve = function(identifier, type, cb) {
  if (typeof type == 'function') {
    cb = type;
    type = undefined;
  }
  
  // FIXME: this typing here is weird, in webfinger too
  this.resolveServices(identifier, type, function(err, services) {
    if (err) { return cb(err); }
    
    var meta = {};
    meta.services = services;
    return cb(null, meta);
  });
}

Resolver.prototype.resolveServices = function(identifier, type, cb) {
  if (typeof type == 'function') {
    cb = type;
    type = undefined;
  }
  
  var url = uri.parse(identifier);
  if (url.protocol != 'acct:') {
    // This plugin only supports resolving of `acct:`-type identifiers.
    return cb(new BadNameError('URI scheme not supported: ' + url.protocol));
  }
  
  var exchanges = this._exchanges;
  
  dns.resolve(url.hostname, 'MX', function (err, records) {
    if (err) { return cb(err); }
    
    records.sort(function(lhs, rhs) { return rhs.priority < lhs.priority; });
    
    var result = {}
      , record
      , services
      , i, len;
    for (i = 0, len = records.length; i < len; ++i) {
      record = records[i];
      services = exchanges[record.exchange.toLowerCase()];
      
      if (services) {
        Object.keys(services).forEach(function(type) {
          var val = services[type];
          if (typeof val == 'string') {
            result[type] = [ { location: val } ];
          } else { // array
            result[type] = [];
            val.forEach(function(el) {
              if (typeof el == 'string') {
                result[type].push({ location: el });
              } else { // object
                result[type].push(el);
              }
            })
          }
        });
        
        if (type) {
          result = result[type];
          if (!result) { return cb(new NoDataError('Service not found: ' + type)); }
          return cb(null, result);
        }
        return cb(null, result);
      }
    }
    
    // Unable to find a service mapping from the configured set of mail
    // exchanges.
    return cb(new ProtocolNotSupportedError('Unknown mail exchange: ' + url.hostname));
  });
}




exports = module.exports = function(exchanges) {
  if (!exchanges) {
    exchanges = {};
    
    DEFAULT_PROVIDERS.forEach(function(provider) {
      var conf = require('./providers/' + provider);
      var i, len;
      for (i = 0, len = conf.exchanges.length; i < len; ++i) {
        exchanges[conf.exchanges[i].toLowerCase()] = conf.services;
      }
    });
  }
  
  
  return new Resolver(exchanges);
}
