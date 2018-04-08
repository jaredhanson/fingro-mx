/**
 * `NoSupportError` error.
 *
 * @api private
 */
function NoSupportError(message) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'NoSupportError';
  this.message = message;
  this.code = 'ENOSUPPORT';
}

/**
 * Inherit from `Error`.
 */
NoSupportError.prototype.__proto__ = Error.prototype;


/**
 * Expose `NoSupportError`.
 */
module.exports = NoSupportError;
