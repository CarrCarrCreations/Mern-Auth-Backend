const Error = (errorMessage, status) => {
  return {
    status,
    message: errorMessage,
  };
};

const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      message: err.message,
    },
  });
};

module.exports = { Error, errorHandler };
