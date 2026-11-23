const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (buffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "carpentry-shop", resource_type: "image" },
      (error, result) => (error ? reject(error) : resolve(result)),
    );
    stream.end(buffer);
  });

exports.uploadImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "NO_FILE",
        message: "لازم ترفع صورة واحدة على الأقل",
      });
    }

    const results = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file.buffer)),
    );

    const urls = results.map((r) => r.secure_url);

    res.status(201).json({ data: { urls } });
  } catch (err) {
    next(err);
  }
};
