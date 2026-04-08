const transporter = require("../config/emailConfig");
const OtpModel = require("../model/otpVerifyModel");
const path = require("path");
const ejs = require("ejs");

const sendEmailVerificationOtp = async (user) => {
  try {
    //generate random 4 digit num
    const otp = Math.floor(1000 + Math.random() * 9000);

    //saving otp in db
    const data = await new OtpModel({
      userId: user._id,
      otp,
    }).save();

    const filePath = path.join(process.cwd(), "views/emailOtp.ejs");
    const htmlContent = await ejs.renderFile(filePath, { otp });

    transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "Email Otp Verification",
      html: htmlContent,
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = sendEmailVerificationOtp;
