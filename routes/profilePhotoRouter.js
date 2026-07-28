const express = require("express");
const {
  photoUpload,
  uploadMiddleware,
  getProfilePhoto,
} = require("../controller/photoUpload");
const { isAuthenticated } = require("../middleware/middleware");
const router = express.Router();

router.get("/photo", isAuthenticated, getProfilePhoto);
router.post("/uploads", isAuthenticated, uploadMiddleware, photoUpload);

module.exports = router;
