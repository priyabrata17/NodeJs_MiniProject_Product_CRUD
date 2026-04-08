/**
 * @swagger
 * components:
 *   
 *   schemas:
 *     UserInput:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - phone
 *         - city
 *         - image
 *       properties:
 *         username:
 *           type: string
 *           description: The name of the user
 *         email:
 *           type: string
 *           description: User email
 *         password:
 *           type: string
 *           description: User password
 *         phone:
 *           type: string
 *           description: User phone number
 *         city:
 *           type: string
 *           description: User city
 *         image:
 *           type: string
 *           format: binary
 *           description: Image file
 *
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         city:
 *           type: string
 *         image:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *             fileId:
 *               type: string
 *         isVerified:
 *           type: boolean
 *           description: Will become true when user verify email.
 */
/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & User Account APIs
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UserInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *       400:
 *         description: Validation error
 */

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - rememberMe
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               rememberMe:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Login successful (returns tokens)
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /auth/dashboard:
 *   get:
 *     summary: Get user dashboard (Protected)
 *     tags: [Auth]
 *     security:
 *       - xAccessToken: []
 *     responses:
 *       200:
 *         description: Dashboard data
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - xAccessToken: []
 *     responses:
 *       200:
 *         description: Logout successful
 */

/**
 * @swagger
 * /auth/refresh-access:
 *   post:
 *     summary: Get new access token using refresh token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token generated
 */

/**
 * @swagger
 * /auth/reset-password-link:
 *   post:
 *     summary: Send reset password link
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset link sent
 */

/**
 * @swagger
 * /auth/reset-password/{token}/{id}:
 *   post:
 *     summary: Reset password
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */

/**
 * @swagger
 * /auth/change-profile-image:
 *   patch:
 *     summary: Change profile image
 *     tags: [Auth]
 *     security:
 *       - xAccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile image updated
 */

/**
 * @swagger
 * /auth/delete-account-link:
 *   post:
 *     summary: Send delete account link
 *     tags: [Auth]
 *     security:
 *       - xAccessToken: []
 *     responses:
 *       200:
 *         description: Delete link sent
 */

/**
 * @swagger
 * /auth/delete-account/{token}/{id}:
 *   delete:
 *     summary: Delete user account
 *     tags: [Auth]
 *     security:
 *       - xAccessToken: []
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - confirm
 *             properties:
 *               confirm:
 *                 type: string
 *                 example: CONFIRM
 *                 description: Type "CONFIRM" to delete account
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       400:
 *         description: Keyword mismatch or invalid request
 *       404:
 *         description: User not found
 */



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
