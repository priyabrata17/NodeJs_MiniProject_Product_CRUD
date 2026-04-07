const ProductModel = require("../model/productModel");
const { cloudinary } = require("../config/cloudinaryConfig");
const deleteFiles = require("../helper/deleteFiles");

class ProductController {
  async createProduct(req, res) {
    const { title, company, description, price } = req.body;
    const files = req?.files;

    if (!title || !company || !description || !price) {
      deleteFiles(files);
      return res.status(400).json({
        message: "All fields are required !!",
      });
    }

    if (!files.length || files.length > 5) {
      return res.status(400).json({
        message:
          "Image file is required and maximum of 5 images are allowed at a time !!",
      });
    }

    const newProduct = new ProductModel({
      title,
      company,
      description,
      price,
    });

    let imgArr = [];
    for (let file of files) {
      imgArr.push({ url: file.path, fileId: file.filename });
    }

    newProduct.images = imgArr;
    await newProduct.save();

    return res.status(201).json({
      status: true,
      message: "Product created successfully",
      data: newProduct,
    });
  }

  async viewProducts(req, res) {
    const page = parseInt(req?.query?.page) || 1;
    const limit = parseInt(req?.query?.limit) || 6;
    const skip = (page - 1) * limit;

    const totalProducts = await ProductModel.countDocuments();
    const allProducts = await ProductModel.find({}, { __v: 0 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      status: true,
      message: "Data fetch successfully",
      page,
      limit,
      totalPages,
      data: allProducts,
    });
  }

  async productDetails(req, res) {
    const existingProduct = await ProductModel.findById(req.params.id, {
      __v: 0,
    });
    if (!existingProduct) {
      return res.status(404).json({
        message: "Product doesn't exists !!",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Data fetch successfully",
      data: existingProduct,
    });
  }

  async updateProduct(req, res) {
    const existingProduct = await ProductModel.findById(req.params.id, {
      __v: 0,
    });
    if (!existingProduct) {
      return res.status(404).json({
        status: false,
        message: "No product found !!",
      });
    }

    const { title, price, description, company } = req.body;
    let files = req?.files;
    if (!title || !price || !description || !company) {
      await deleteFiles(files);
      return res.status(400).json({
        status: false,
        message: "All fields are required !!",
      });
    }

    Object.assign(existingProduct, {
      title,
      price,
      description,
      company,
    });

    if (files?.length) {
      let newArr = files.map((file) => ({
        url: file.path,
        fileId: file.filename,
      }));

      existingProduct.images = [...newArr, ...existingProduct.images];
    }

    const updatedProduct = await existingProduct.save();

    return res.status(200).json({
      status: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  }

  // async changeProductImage(req, res) {
  //   const { productId } = req.params;
  //   const { oldFileId } = req.query;
  //   const existingProduct = await ProductModel.findById(productId, { __v: 0 });
  //   const file = req?.file;
  //   if (!existingProduct) {
  //     return res.status(404).json({
  //       status: false,
  //       message: "Error! No product found !!",
  //     });
  //   }

  //   if (!file) {
  //     return res.status(400).json({
  //       status: false,
  //       message: "Error! Image file is required !!",
  //     });
  //   }

  //   // Method-1
  //   // const fileIdx = existingProduct.images.findIndex(
  //   //   (img) => img.fileId === oldFileId
  //   // );
  //   // if (fileIdx === -1) {
  //   //   return res.status(404).json({
  //   //     status: false,
  //   //     message: "Error! Image not found !!",
  //   //   });
  //   // }

  //   await cloudinary.uploader.destroy(oldFileId);
  //   // existingProduct.images[fileIdx] = { url: file.path, fileId: file.filename };

  //   //Method-2
  //   existingProduct.images = existingProduct.images.map((img) =>
  //     img.fileId === oldFileId ? { url: file.path, fileId: file.filename } : img
  //   );

  //   await existingProduct.save();
  //   return res.status(200).json({
  //     status: true,
  //     message: "Image updated successfully",
  //     data: existingProduct,
  //   });
  // }

  async deleteProductImage(req, res) {
    const { productId } = req.params;
    const { oldFileId } = req.query;
    const existingProduct = await ProductModel.findById(productId, { __v: 0 });
    if (!existingProduct) {
      return res.status(404).json({
        status: false,
        message: "Error! No product found !!",
      });
    }

    existingProduct.images = existingProduct.images.filter(
      (img) => img.fileId !== oldFileId
    );
    await existingProduct.save();

    cloudinary.uploader
      .destroy(oldFileId)
      .catch((err) => console.error("Cloudinary delete failed:", err));

    return res.status(200).json({
      status: true,
      message: "Image deleted successfully",
      data: existingProduct,
    });
  }

  async deleteProduct(req, res) {
    const existingProduct = await ProductModel.findById(req.params.productId);
    if (!existingProduct) {
      return res.status(404).json({
        status: false,
        message: "Error! No product found !!",
      });
    }

    if (existingProduct?.images?.length) {
      try {
        Promise.all(
          existingProduct.images.map((img) =>
            cloudinary.uploader.destroy(img.fileId)
          )
        );
      } catch (error) {
        console.log("An error occured when deleting files: ", error);
      }
    }

    await ProductModel.findByIdAndDelete(req.params.productId);
    return res.status(200).json({
      status: true,
      message: "Product deleted successfully",
    });
  }
}

module.exports = new ProductController();
