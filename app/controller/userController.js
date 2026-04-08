const UserModel = require("../model/userModel");
const { cloudinary } = require("../config/cloudinaryConfig");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sendEmailVerificationOtp = require("../helper/sendEmailOtp");
const OtpVerifyModel = require("../model/otpVerifyModel");
const generateToken = require("../helper/generateTokens");
const TokenModel = require("../model/tokenModel");
const transporter = require("../config/emailConfig");
const path = require("path");
const ejs = require("ejs");

class UserController {
  //signup
  async signup(req, res) {
    const { username, email, password, phone, city } = req.body;
    if (!username || !email || !password || !phone || !city) {
      if (req.file) {
        cloudinary.uploader
          .destroy(req.file.filename)
          .catch((err) => console.error("Cloudinary image delete fails", err));
      }
      return res.status(400).json({
        message: "all fields are required !!",
      });
    }
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      if (req.file) {
        cloudinary.uploader
          .destroy(req.file.filename)
          .catch((err) => console.error("Cloudinary image delete fails", err));
      }
      return res.status(409).json({
        message: "Email is already exists !!",
      });
    }
    if (!req?.file) {
      return res.status(400).json({
        status: false,
        message: "Error! Image file is required !!",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({
      username,
      email,
      password: hashedPassword,
      phone,
      city,
    });

    newUser.image = {
      url: req.file.path,
      fileId: req.file.filename,
    };

    await newUser.save();

    sendEmailVerificationOtp(newUser);

    return res.status(201).json({
      status: true,
      message:
        "User created successfully and a verification code sent to your email for verification",
      data: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        city: newUser.city,
        image: newUser.image,
        isVerified: newUser.isVerified,
      },
    });
  }

  //verify otp
  async verifyOtp(req, res) {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({
        message: "All fields are required !!",
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        message: "No user found !!",
      });
    }

    //check email is alraedy verified
    if (existingUser.isVerified) {
      return res.status(400).json({
        message: "Email is already verified",
      });
    }

    //check for matching otp with db
    const emailVerifivation = await OtpVerifyModel.findOne({
      otp: otp,
      userId: existingUser._id,
    });

    if (!emailVerifivation) {
      if (!existingUser.isVerified) {
        sendEmailVerificationOtp(existingUser);
        return res.status(400).json({
          message: "Invalid otp, new otp sent to your email.",
        });
      }
      return res.status(400).json({ status: false, message: "Invalid OTP" });
    }

    //check otp expiry
    const currTime = new Date();
    const expiryTime = new Date(
      emailVerifivation.createdAt.getTime() + 15 * 60 * 1000
    );

    if (currTime > expiryTime) {
      sendEmailVerificationOtp(existingUser);
      return res.status(400).json({
        message: "Otp expired, a new otp sent to your email.",
      });
    }

    //everything is ok
    existingUser.isVerified = true;
    await existingUser.save();

    //delete otp from db
    await OtpVerifyModel.deleteMany({ userId: existingUser._id });

    return res.status(200).json({
      message: "Otp verified successfully.",
      data: {
        _id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        phone: existingUser.phone,
        city: existingUser.city,
        image: existingUser.image,
        isVerified: existingUser.isVerified,
      },
    });
  }

  //login
  async login(req, res) {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "All fields are required !!",
      });
    }

    const existingUser = await UserModel.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        message: "User does not exists !!",
      });
    }

    // if (!existingUser.isVerified) {
    //   await sendEmailVerificationOtp(existingUser);
    //   return res.status(400).json({
    //     message:
    //       "Email is not verified.A verification OTP send to your email.Please verify before continue.",
    //   });
    // }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Incorrect password !!",
      });
    }

    const { accessToken, refreshToken, rememberMeFlag } = await generateToken(
      existingUser,
      rememberMe
    );

    const refreshTokenMaxAge = rememberMeFlag
      ? 30 * 24 * 60 * 60 * 1000
      : undefined;

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: refreshTokenMaxAge,
    });

    return res.status(200).json({
      status: true,
      message: "User login successfully",
      token: accessToken,
      data: {
        id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
      },
    });
  }

  //new accessToken frontend api
  async newAccessToken(req, res) {
    const refreshToken = req?.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(403).json({
        message: "No refresh token found !!",
      });
    }

    try {
      const existingToken = await TokenModel.findOne({ token: refreshToken });
      if (!existingToken) {
        return res.status(403).json({
          message: "No refresh token found !!",
        });
      }

      const decodedToken = jwt.verify(
        refreshToken,
        process.env.JWT_ACCESS_TOKEN_SECRET_KEY
      );
      const payload = {
        id: decodedToken.id,
        email: decodedToken.email,
      };

      const accessToken = jwt.sign(
        payload,
        process.env.JWT_ACCESS_TOKEN_SECRET_KEY,
        { expiresIn: "15m" }
      );
      return res.status(200).json({
        message: "new access token generated successfully",
        token: accessToken,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(403).json({
        message: "Invalid refresh token !!",
      });
    }
  }

  //userProfile
  async dashboard(req, res) {
    const existingUser = await UserModel.findOne({ email: req?.user.email });
    if (!existingUser) {
      return res.status(404).json({
        message: "No user found, Please login to continue",
      });
    }

    return res.status(200).json({
      message: "Welcome to your dashboard",
      data: {
        id: existingUser._id,
        username: existingUser.username,
        email: existingUser.email,
        phone: existingUser.phone,
        city: existingUser.city,
        image: existingUser.image,
      },
    });
  }

  //logout
  async logout(req, res) {
    const existingUser = await UserModel.findOne({ email: req.user.email });
    if (!existingUser) {
      return res.status(404).json({
        message: "No login user found",
      });
    }
    const refreshToken = req?.cookies?.refreshToken;
    await TokenModel.findOneAndDelete({
      userId: req.user.id,
      token: refreshToken,
    });
    res.clearCookie("refreshToken");

    return res.status(200).json({
      message: "User logout successfully",
    });
  }

  // req pass reset link
  async forgotPasswordLink(req, res) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const existingUser = await UserModel.findOne({ email: email });
    if (!existingUser) {
      return res.status(404).json({
        message: "No user found !!",
      });
    }

    const secret = existingUser._id + process.env.JWT_ACCESS_TOKEN_SECRET_KEY;
    const token = jwt.sign({ userId: existingUser._id }, secret, {
      expiresIn: "20m",
    });

    //a page generate by frontend with this link
    const resetLink = `${process.env.FRONTEND_HOST}/api/auth/reset-password-page/${token}/${existingUser._id}`;

    const filePath = path.join(process.cwd(), "views/passwordResetLink.ejs");
    const htmlContent = await ejs.renderFile(filePath, { resetLink });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: existingUser.email,
      subject: "Password Reset",
      html: htmlContent,
    });

    return res.status(200).json({
      message: "A password reset link sent to your email",
      resetLink,
    });
  }

  //verify pass req otp
  async resetPassword(req, res) {
    const { password, confirmPassword } = req.body;
    const { id, token } = req.params;
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        message: "No user found",
      });
    }

    const new_secret =
      existingUser._id + process.env.JWT_ACCESS_TOKEN_SECRET_KEY;

    let decoded;
    try {
      decoded = jwt.verify(token, new_secret);
    } catch (error) {
      return res.status(400).json({
        message: "Expired or Invalid Token !!",
      });
    }

    if (decoded.userId !== id) {
      return res.status(403).json({
        message: "Error! Unauthorized request !!",
      });
    }

    if (!password || !confirmPassword) {
      return res.status(400).json({
        message: "all fields are required !!",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "password and confirm password should be same !!",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.findByIdAndUpdate(id, { password: hashedPassword });

    return res.status(200).json({
      message: "Password reset successfully",
    });
  }

  //change Profile pic
  async changeProfilePic(req, res) {
    const existingUser = await UserModel.findOne({ email: req.user.email });
    if (!existingUser) {
      return res.status(404).json({
        message: "No user found",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Image file is required",
      });
    }
    if (existingUser?.image?.fileId) {
      await cloudinary.uploader.destroy(existingUser.image.fileId);
    }
    existingUser.image = {
      url: req.file.path,
      fileId: req.file.filename,
    };
    await existingUser.save();
    return res.status(200).json({
      message: "Profile pic updated successfully",
    });
  }

  //delete user link
  async deleteUserLink(req, res) {
    const existingUser = await UserModel.findById(req.user.id);
    if (!existingUser) {
      return res.status(404).json({
        message: "No user found !!",
      });
    }

    const secret = process.env.JWT_ACCESS_TOKEN_SECRET_KEY + existingUser._id;
    const token = jwt.sign({ userId: existingUser._id }, secret, {
      expiresIn: "20m",
    });

    //a page generate by fronend using this link
    const link = `${process.env.FRONTEND_HOST}/api/auth/delete-account-page/${token}/${existingUser._id}`;

    const filePath = path.join(process.cwd(), "views/deleteAccount.ejs");
    const htmlContent = await ejs.renderFile(filePath, { link });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: existingUser.email,
      subject: "Delete Account",
      html: htmlContent,
    });

    return res.status(200).json({
      status: true,
      message: "A confirmation link send to your email",
      link,
    });
  }

  //Delete user
  async deleteUser(req, res) {
    const { id, token } = req.params;
    const existingUser = await UserModel.findById(id);
    const {confirm} = req.body;

    if (!existingUser) {
      return res.status(404).json({
        message: "No user Found !!",
      });
    }
    const secret = process.env.JWT_ACCESS_TOKEN_SECRET_KEY + existingUser._id;
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (error) {
      return res.status(400).json({
        message: "Invalid or expired token !!",
      });
    }

    if (decoded.userId !== id) {
      return res.status(403).json({
        messge: "Error! Unauthorized request !!",
      });
    }

    if(confirm !== "CONFIRM") {
      return res.status(400).json({
        status: false,
        message: "Keyword mismatch! Please try again"
      });
    }

    await UserModel.findByIdAndDelete(id);

    if (existingUser.image?.fileId) {
      try {
        await cloudinary.uploader.destroy(existingUser.image.fileId);
      } catch (error) {
        console.error("Cloudinary image delete fails", error?.message || error);
      }
    }

    return res.status(200).json({
      status: true,
      message: "User account deleted successfully",
    });
  }
}

module.exports = new UserController();
