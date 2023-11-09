/**
 * `NotImplementedError` error.
 *
 * @api private
 */
function NotImplementedError(message) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'NotImplementedError';
  this.message = message;
  this.code = 'ENOTIMP';
}

/**
 * Inherit from `Error`.
 */
NotImplementedError.prototype.__proto__ = Error.prototype;


/**
 * Expose `NotImplementedError`.
 */
module.exports = NotImplementedError;
