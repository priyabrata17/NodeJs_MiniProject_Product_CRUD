/**
 * @swagger
 * components:
 *   schemas:
 *     ProductInput:
 *       type: object
 *       required:
 *         - title
 *         - company
 *         - description
 *         - price
 *         - images
 *       properties:
 *         title:
 *           type: string
 *           description: Product title
 *         company:
 *           type: string
 *           description: Company name
 *         description:
 *           type: string
 *           description: Product description
 *         price:
 *           type: string
 *           description: Product price
 *         images:
 *           type: array
 *           items:
 *             type: string
 *             format: binary
 *           description: Upload up to 5 images
 *
 *     ProductResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Product ID
 *         title:
 *           type: string
 *         company:
 *           type: string
 *         description:
 *           type: string
 *         price:
 *           type: string
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               fileId:
 *                 type: string
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management APIs
 */

/**
 * @swagger
 * /create/product:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - xAccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 */

/**
 * @swagger
 * /all-product:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProductResponse'
 */

/**
 * @swagger
 * /product-details/{id}:
 *   get:
 *     summary: Get product details
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /update/product/{id}:
 *   patch:
 *     summary: Update product
 *     tags: [Products]
 *     security:
 *       - xAccessToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductResponse'
 */

/**
 * @swagger
 * /delete/product-image/{productId}:
 *   patch:
 *     summary: Delete a specific product image
 *     tags: [Products]
 *     security:
 *       - x-access-token: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *       - in: query
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: Cloudinary file ID of the image to delete
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       400:
 *         description: fileId is required
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /delete/product/{productId}:
 *   delete:
 *     summary: Delete a product
 *     tags: [Products]
 *     security:
 *       - xAccessToken: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 */

const express = require("express");
const router = express.Router();
const authCheck = require("../middleware/authCheck");
const uploadImages = require("../helper/fileUpload");
const productController = require("../controller/productController");
const wrapAsync = require("../helper/wrapAsync");

router.post(
  "/create/product",
  authCheck,
  uploadImages.array("images", 5),
  wrapAsync(productController.createProduct)
);

router.get("/all-product", wrapAsync(productController.viewProducts));

router.get("/product-details/:id", wrapAsync(productController.productDetails));

router.patch(
  "/update/product/:id",
  authCheck,
  uploadImages.array("images", 5),
  wrapAsync(productController.updateProduct)
);

// router.patch(
//   "/update/product-image/:productId",
//   authCheck,
//   uploadImages.single("images"),
//   wrapAsync(productController.changeProductImage)
// );

router.patch(
  "/delete/product-image/:productId",
  authCheck,
  wrapAsync(productController.deleteProductImage)
);

router.delete(
  "/delete/product/:productId",
  authCheck,
  wrapAsync(productController.deleteProduct)
);

module.exports = router;
