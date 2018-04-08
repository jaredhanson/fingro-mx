/**
 * `IDNoSupportError` error.
 *
 * @api private
 */
function IDNoSupportError(message) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'IDNoSupportError';
  this.message = message;
  this.code = 'EIDNOSUPPORT';
}

/**
 * Inherit from `Error`.
 */
IDNoSupportError.prototype.__proto__ = Error.prototype;


/**
 * Expose `IDNoSupportError`.
 */
module.exports = IDNoSupportError;
