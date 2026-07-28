const express = require("express");
const passport = require("passport");
const { isAuthenticated } = require("../middleware/middleware");
const User = require("../models/user");
const router = express.Router();
const bcrypt = require("bcryptjs");
const Otp = require("../models/otp");

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
const OTP_EXPIRES_MINUTES = parseInt(
  process.env.OTP_EXPIRES_MINUTES || "10",
  10,
);

router.post("/login", passport.authenticate("local"), async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId).populate("institute");
  // console.log("Logged in user: ", user);

  res.json({
    message: "Login successful",
    user: {
      profile: user.profile,
      name: user.name,
      id: userId,
      role: user.role,
      username: user.username,
      Institute: user.institute,
    },
  });
  // console.log("Login success");
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
      return res.status(403).json({ error: "Unauthorized" });
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

//Send OTP
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: `No user found for ${email}` });
  }

  const otp = generateOtp();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_EXPIRES_MINUTES * 60 * 1000);

  // Upsert OTP document (delete old if any)
  await Otp.findOneAndDelete({ email });
  await Otp.create({ email, otpHash, expiresAt });

  return res.json({
    otp: otp, //Temporary
    success: true,
    message: "OTP sent",
  });
});

router.post("/verify-otp", async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP required" });
    }

    const otpDoc = await Otp.findOne({ email });
    if (!otpDoc) {
      return res.status(400).json({ error: "OTP not found or expired" });
    }

    if (new Date() > otpDoc.expiresAt) {
      await Otp.deleteOne({ email });
      return res.status(400).json({ error: "OTP expired" });
    }

    const isMatch = await bcrypt.compare(otp, otpDoc.otpHash);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const user = await User.findOne({ email }).populate("institute");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.login(user, async (err) => {
      if (err) return next(err);

      await Otp.deleteOne({ email });

      return res.json({
        message: "Login successful via OTP",
        user: {
          id: user._id,
          name: user.name,
          username: user.username,
          role: user.role,
          institute: user.institute,
        },
      });
    });
  } catch (err) {
    console.error("verifyOtpErr", err);
    res.status(500).json({ error: "Server error" });
  }
});

//set new password
router.post("/password/new/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword, verifyNewPassword } = req.body;

    if (req.user._id.toString() !== id) {
      return res.status(403).json({ error: "Invalid user" });
    }

    if (!newPassword || !verifyNewPassword) {
      return res.status(400).json({ error: "Password fields required" });
    }

    if (newPassword !== verifyNewPassword) {
      return res.status(400).json({
        error: "New password and verify password must match",
      });
    }

    await req.user.setPassword(newPassword);

    req.user.isPasswordSet = true;
    await req.user.save();

    res.json({
      success: true,
      message: "Password set successfully",
    });
  } catch (err) {
    console.error("setPasswordErr", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
