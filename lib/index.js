var uri = require('url')
  , dns = require('dns')
  , NoDataError = require('./errors/nodataerror');

var DEFAULT_PROVIDERS = [ 'google' ];


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
  
  
  var plugin = {};
  
  plugin.resolveServices = function(identifier, type, cb) {
    if (typeof type == 'function') {
      cb = type;
      type = undefined;
    }
    
    var url = uri.parse(identifier);
    if (url.protocol != 'acct:') {
      // This plugin only supports resolving of `acct:`-type identifiers.  If
      // the identifier is unsupported, return without an error and without
      // resolving services.  The expectation is that other discovery mechanisms
      // are registered with `fingro` that will be used as alternatives.
      return cb(null);
    }
    
    
    dns.resolve(url.hostname, 'MX', function (err, records) {
      if (err) { return cb(err); }
      
      records.sort(function(lhs, rhs) { return rhs.priority < lhs.priority; });
      
      var result = {}
        , record
        , services
        , i, len;
      for (i = 0, len = records.length; i < len; ++i) {
        record = records[i];
        services = exchanges[record.exchange.toLowerCase()]
        
        if (services) {
          Object.keys(services).forEach(function(type) {
            var val = services[type];
            if (typeof val == 'string') {
              result[type] = { location: val };
            } else {
              result[type] = val;
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
      // exchanges.  Return without an error and without resolving services.
      // The expectation is that other discovery mechanisms are registered
      // with `fingro` that will be used as alternatives.
      return cb(null);
    });
  }
  
  return plugin;
}
