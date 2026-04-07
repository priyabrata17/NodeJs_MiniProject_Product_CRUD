const jwt = require("jsonwebtoken");

const authCheck = async (req, res, next) => {
  const accessToken =
    req?.body?.token || req?.query?.token || req?.headers["x-access-token"];

  if (!accessToken) {
    return res.status(400).json({
      message: "No token found !!",
    });
  }
  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_TOKEN_SECRET_KEY
    );
    req.user = decoded;
    return next();
  } catch (error) {
    console.log(error.name, error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Access token expired !!",
      });
    }
    return res.status(403).json({
      message: "Invalid access token !!",
    });
  }
};

module.exports = authCheck;

// const refreshToken = req.cookies.refreshToken;
//     if (!refreshToken) {
//       return res.status(401).json({
//         message: "Refresh token not provided",
//       });
//     }
//     try {
//       const decodedToken = jwt.verify(
//         refreshToken,
//         process.env.JWT_ACCESS_TOKEN_SECRET_KEY
//       );

//       const existingToken = await TokenModel.findOne({ token: refreshToken });
//       if (!existingToken) {
//         return res.status(401).json({
//           message: "No token found !!",
//         });
//       }

//       const payload = {
//         id: decodedToken.id,
//         email: decodedToken.email,
//       };

//       const newAccessToken = jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET_KEY, {expiresIn: "15m"});
//       res.cookie("accessToken", newAccessToken);
// } catch (error) {}
