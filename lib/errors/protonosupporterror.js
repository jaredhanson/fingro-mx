/**
 * `ProtoNoSupportError` error.
 *
 * @api private
 */
function ProtoNoSupportError(message) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'ProtoNoSupportError';
  this.message = message;
  this.code = 'EPROTONOSUPPORT';
}

/**
 * Inherit from `Error`.
 */
ProtoNoSupportError.prototype.__proto__ = Error.prototype;


/**
 * Expose `ProtoNoSupportError`.
 */
module.exports = ProtoNoSupportError;
