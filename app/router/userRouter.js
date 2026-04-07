const express = require("express");
const router = express.Router();
const uploadImage = require("../helper/fileUpload");
const userController = require("../controller/userController");
const wrapAsync = require("../helper/wrapAsync");
const authCheck = require("../middleware/authCheck");

router.post(
  "/auth/signup",
  uploadImage.single("image"),
  wrapAsync(userController.signup)
);
router.post("/auth/verify-otp", wrapAsync(userController.verifyOtp));
router.post("/auth/login", wrapAsync(userController.login));
router.get("/auth/dashboard", authCheck, wrapAsync(userController.dashboard));
router.post("/auth/logout", authCheck, wrapAsync(userController.logout));
router.post("/auth/refresh-access", wrapAsync(userController.newAccessToken));

router.post(
  "/auth/reset-password-link",
  wrapAsync(userController.forgotPasswordLink)
);

router.post(
  "/auth/reset-password/:token/:id",
  wrapAsync(userController.resetPassword)
);

router.patch(
  "/auth/change-profile-image",
  authCheck,
  uploadImage.single("image"),
  wrapAsync(userController.changeProfilePic)
);

router.post(
  "/auth/delete-account-link",
  authCheck,
  wrapAsync(userController.deleteUserLink)
);

router.delete(
  "/auth/delete-account/:token/:id",
  authCheck,
  wrapAsync(userController.deleteUser)
);

module.exports = router;
