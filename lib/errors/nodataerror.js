/**
 * `NoDataError` error.
 *
 * @api private
 */
function NoDataError(message) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'NoDataError';
  this.message = message;
  this.code = 'ENODATA';
}

/**
 * Inherit from `Error`.
 */
NoDataError.prototype.__proto__ = Error.prototype;


/**
 * Expose `NoDataError`.
 */
module.exports = NoDataError;
