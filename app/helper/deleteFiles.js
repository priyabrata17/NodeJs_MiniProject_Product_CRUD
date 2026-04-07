const { cloudinary } = require("../config/cloudinaryConfig");

module.exports = async (filesArr) => {
  try {
    if (!filesArr?.length) return;
    await Promise.all(
      filesArr.map((file) => {
        cloudinary.uploader.destroy(file.filename);
      })
    );
  } catch (error) {
    console.log("An error occured when deleting files: ", error?.message || error);
  }
};
