// Global error handler middleware
function errorHandler(err, req, res, next) {
// Add a global error log
  console.log("🔥 GLOBAL ERROR HANDLER:", err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Server Error",
    errors: err.errors || undefined,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
}

module.exports = errorHandler;