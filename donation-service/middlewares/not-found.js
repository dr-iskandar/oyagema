const { StatusCodes } = require("http-status-codes");

const notFound = (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: "error",
    message: "Route does not exist",
  });
};

module.exports = notFound;