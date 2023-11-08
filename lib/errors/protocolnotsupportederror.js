/**
 * `ProtocolNotSupportedError` error.
 *
 * @api private
 */
function ProtocolNotSupportedError(message) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'ProtocolNotSupportedError';
  this.message = message;
  this.code = 'EPROTONOSUPPORT';
}

/**
 * Inherit from `Error`.
 */
ProtocolNotSupportedError.prototype.__proto__ = Error.prototype;


/**
 * Expose `ProtocolNotSupportedError`.
 */
module.exports = ProtocolNotSupportedError;
