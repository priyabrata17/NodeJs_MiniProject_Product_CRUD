const jwt = require("jsonwebtoken");
const TokenModel = require("../model/tokenModel");

const generateToken = async (user, rememberMe) => {
  try {
    const payload = {
      id: user._id,
      email: user.email,
    };

    const rememberMeFlag = ["1", "on", "yes", "true"].includes(
      String(rememberMe).toLowerCase()
    );
    const refreshTokenExpiry = rememberMe ? "30d" : "24h";

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
      { expiresIn: refreshTokenExpiry }
    );

    await TokenModel.findOneAndUpdate(
      { userId: user._id },
      { $set: { token: refreshToken, rememberMe: rememberMeFlag }},
      { upsert: true, returnDocument: "after" }
    );

    return { accessToken, refreshToken, rememberMeFlag };
  } catch (error) {
    console.error("Token error: ", error.message);
    throw new Error(error.message);
  }
};

module.exports = generateToken;
