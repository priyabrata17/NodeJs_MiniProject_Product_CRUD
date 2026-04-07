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
