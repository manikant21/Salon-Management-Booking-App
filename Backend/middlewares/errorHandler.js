export const errorHandler = (err, req, res, next) => {
  console.error("Global Error Handler:", err);


  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.errors.map((e) => e.message),
    });
  }


  if (err.name === "SequelizeUniqueConstraintError") {
    return res.status(400).json({
      success: false,
      message: "Duplicate entry",
      errors: err.errors.map((e) => e.message),
    });
  }


  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

 
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
};
