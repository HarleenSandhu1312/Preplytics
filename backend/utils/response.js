/**
 * utils/response.js
 * Standardized API response helpers
 * Keeps response format consistent across all controllers.
 */

const successResponse = (res, statusCode, message, data = {}) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const errorResponse = (res, statusCode, message, errors = null) => {
  return res.status(statusCode).json({ success: false, message, ...(errors && { errors }) });
};

module.exports = { successResponse, errorResponse };
