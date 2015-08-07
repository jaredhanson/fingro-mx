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
    
    
    dns.resolve('_xmpp-client._tcp.gmail.com', 'SRV', function (err, records) {
      console.log('HERE ARE SRV RECORDS');
      console.log(err)
      console.log(records)
      
      /*
[ { name: 'alt4.xmpp.l.google.com',
    port: 5222,
    priority: 20,
    weight: 0 },
  { name: 'alt3.xmpp.l.google.com',
    port: 5222,
    priority: 20,
    weight: 0 },
  { name: 'alt1.xmpp.l.google.com',
    port: 5222,
    priority: 20,
    weight: 0 },
  { name: 'alt2.xmpp.l.google.com',
    port: 5222,
    priority: 20,
    weight: 0 },
  { name: 'xmpp.l.google.com', port: 5222, priority: 5, weight: 0 } ]
      */
      
    });
    
    
    switch (url.protocol) {
    case 'acct:':
      dns.resolve(url.hostname, 'MX', function (err, records) {
        if (err) {
          // Ignore the error under the assumption that there are no MX records
          // for this host.  The expectation is that other discovery mechanisms
          // are registered with `fingro` that will be used as alternatives.
          return cb(null);
        }
        // TODO: Normalize the results and pass back.
        
        /*
[ { exchange: 'aspmx.l.google.com', priority: 1 },
  { exchange: 'aspmx2.googlemail.com', priority: 10 },
  { exchange: 'aspmx3.googlemail.com', priority: 10 },
  { exchange: 'alt1.aspmx.l.google.com', priority: 5 },
  { exchange: 'alt2.aspmx.l.google.com', priority: 5 } ]
        */
        
        
        return cb(null, records);
      });
      break;
    default:
      return cb();
    }
  }
  
  return plugin;
}
