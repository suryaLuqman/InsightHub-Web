const notFound = (req, res, next) => {
    res.status(404).json({
      success: false,
      message: 'Resource not found',
      data: null,
    });
  };

  const handleErrors = (err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    err: err.stack,
    data: null,
  });
};
  
 const serverError = (err, req, res, next) => {
  if (err) {
    console.error(err.stack);
    if (err.isJoi) {
      return res.status(400).json({
        status: 'Error',
        message: err.name,
        error: err.message,
      });
    }
    // Hanya tangani konflik jika status code 409 (Conflict)
    if (err.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: err.message,
        data: null,
      });
    }
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
      data: null,
    });
  }
};
  
  module.exports = {
    notFound,
    serverError,
    handleErrors
  };
  