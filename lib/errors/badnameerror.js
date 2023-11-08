/**
 * `BadNameError` error.
 *
 * @api private
 */
function BadNameError(message) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'BadNameError';
  this.message = message;
  this.code = 'BADNAME';
}

/**
 * Inherit from `Error`.
 */
BadNameError.prototype.__proto__ = Error.prototype;


/**
 * Expose `BadNameError`.
 */
module.exports = BadNameError;
