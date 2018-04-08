/**
 * `NotFoundError` error.
 *
 * @api private
 */
function NotFoundError(message) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'NotFoundError';
  this.message = message;
  this.code = 'ENOTFOUND';
}

/**
 * Inherit from `Error`.
 */
NotFoundError.prototype.__proto__ = Error.prototype;


/**
 * Expose `NotFoundError`.
 */
module.exports = NotFoundError;
