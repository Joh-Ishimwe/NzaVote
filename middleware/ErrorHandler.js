/**
 * Error handling middleware function.
 *
 * @param {Error} err - The error object to be handled.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function in the stack.
 *
 * @returns {Object} - A JSON object containing the error details.
 */
const ErrorHandler = (err, req, res, next) => {
    const errStatus = err.statusCode || 500;
    const errMessage = err.message || "Internal Server Error";
  
    // Handle specific error cases, e.g., Mongoose validation errors
    if (err.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation Error",
        errors: err.errors, // Include validation details
      });
    }
  
    // Handle Mongoose duplicate key errors
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate Key Error",
        keyValue: err.keyValue, // Show the field(s) causing the duplicate
      });
    }
  
    // General error response
    res.status(errStatus).json({
      success: false,
      status: errStatus,
      message: errMessage,
      stack: process.env.NODE_ENV === "development" ? err.stack : {}, 
    });
  };
  
  export default ErrorHandler;
  