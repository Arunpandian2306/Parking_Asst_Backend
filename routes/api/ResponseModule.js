function sendSuccess(res, result) {
    const response = {
      status: "SUCCESS",
      result: result,
    };
    res.status(200).json(response);
  }
  
  function sendError(res, message, error, code) {
    const response = {
      status: "FAILURE",
      message: message,
      error: error,
      code: code,
    };
    res.status(422).json(response);
  }
  
  module.exports = {
    sendSuccess,
    sendError,
  };