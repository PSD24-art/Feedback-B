const multer = require("multer");
const User = require("../models/user");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY, //
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB size cap
});

exports.uploadMiddleware = upload.single("profileImage");

exports.photoUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No file was detected in the form." });
    }

    const { userId } = req.body;
    if (!userId) {
      return res
        .status(400)
        .json({ message: "User ID is required to link the profile photo." });
    }

    const cloudUploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "user_profile_pictures",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
      },
      async (error, result) => {
        if (error) {
          return res
            .status(500)
            .json({ message: "Cloud delivery failed.", error });
        }

        try {
          // 6. Save the live URL to your Mongoose schema
          const user = await User.findById(userId);

          if (user) {
            // Update the existing record
            user.profile.imageUrl = result.secure_url;
            user.profile.imageName = req.file.originalname;
            await user.save();

            return res.status(200).json({
              message: "Profile photo updated successfully!",
              photoData: user.profile,
            });
          }
        } catch (dbError) {
          res.status(500).json({
            message: "Failed to write data to database.",
            error: dbError.message,
          });
        }
      },
    );

    cloudUploadStream.end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfilePhoto = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId)
      return res.status(400).json({ message: "Must required userId" });

    const user = await User.findById(userId);

    if (!user) {
      return res.status(500).json({ message: "No user found" });
    }
    res.status(200).json({ photoUrl: user.profile.imageUrl });
  } catch (e) {
    console.log("Error: ", e);
    res.status(500).json({ message: "Something broke" });
  }
};
