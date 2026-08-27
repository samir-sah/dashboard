const jwt = require("jsonwebtoken");
const ApiError = require("./ApiError");

const generateAccessToken = (user) => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw ApiError.internal("ACCESS_TOKEN_SECRET is required");
  }

  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "45m"
    }
  );

};

const generateRefreshToken = (user) => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw ApiError.internal("REFRESH_TOKEN_SECRET is required");
  }

  return jwt.sign(
    {
      id: user._id
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d"
    }
  );

};

module.exports = {
  generateAccessToken,
  generateRefreshToken
};
