const express = require("express");
const passport = require("passport");
const { isAuthenticated } = require("../middleware/middleware");
const router = express.Router();
const Faculty = require("../models/faculty");
router.post("/login", passport.authenticate("local"), async (req, res) => {
  res.json({
    message: "Login successful",
    user: {
      id: req.user._id,
      role: req.user.role,
      username: req.user.username,
    },
  });
});

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }

      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });
});

//change password
router.post("/change-password/:id", isAuthenticated, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { id } = req.params;

  try {
    if (req.user._id.toString() !== id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await req.user.changePassword(oldPassword, newPassword);

    req.user.isPasswordSet = true;
    await req.user.save();

    res.json({ message: "Password changed successfully", role: req.user.role });
  } catch (err) {
    console.error(err);
    res
      .status(400)
      .json({ message: "Error changing password", error: err.message });
  }
});

module.exports = router;
