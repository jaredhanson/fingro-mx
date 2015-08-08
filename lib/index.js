var uri = require('url')
  , dns = require('dns');


module.exports = function() {
  
  var plugin = {};
  
  plugin.resolveServices = function(identifier, type, cb) {
    if (typeof type == 'function') {
      cb = type;
      type = undefined;
    }
    
    console.log('RESOLVE WITH MX: ' + identifier);
    console.log(type);
    
    var url = uri.parse(identifier);
    console.log(url)
    
    if (url.protocol != 'acct:') {
      // This plugin only supports resolving of `acct:`-type identifiers.  If
      // the identifier is unsupported, return without an error and without
      // resolving services.  The expectation is that other discovery mechanisms
      // are registered with `fingro` that will be used as alternatives.
      return cb(null);
    }
    
    
    dns.resolve(url.hostname, 'MX', function (err, records) {
      if (err) {
        // Ignore the error under the assumption that there are no MX records
        // for this host.  The expectation is that other discovery mechanisms
        // are registered with `fingro` that will be used as alternatives.
        return cb(null);
      }
      // TODO: Normalize the results and pass back.
      
      
      return cb(null, records);
    });
  }
  
  return plugin;
}
