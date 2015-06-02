// https://support.google.com/a/answer/174125

exports.exchanges = [
  'ASPMX.L.GOOGLE.COM',
  'ALT1.ASPMX.L.GOOGLE.COM',
  'ALT2.ASPMX.L.GOOGLE.COM',
  'ALT3.ASPMX.L.GOOGLE.COM',
  'ALT4.ASPMX.L.GOOGLE.COM'
]


// https://developers.google.com/identity/protocols/OpenIDConnect
// https://accounts.google.com/.well-known/openid-configuration
exports.services = {
  'oauth2-authorize': 'https://accounts.google.com/o/oauth2/v2/auth',
  'http://openid.net/specs/connect/1.0/issuer': 'https://accounts.google.com/'
}
