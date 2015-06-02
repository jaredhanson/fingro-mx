var uri = require('url')
  , dns = require('dns');


module.exports = function() {
  
  return function(identifier, cb) {
    var url = uri.parse(identifier);
    
    switch (url.protocol) {
    case 'acct:':
      dns.resolve(url.hostname, 'MX', function (err, records) {
        if (err) { return cb(err); }
        // TODO: Normalize the results and pass back.
        return cb(null, records);
      });
      break;
    default:
      return cb();
    }
  }
}
