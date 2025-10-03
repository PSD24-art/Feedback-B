const express = require("express");
const studentRouter = express.Router();
const studentController = require("../controller/studentController");

studentRouter.post("/feedback/:token/check", studentController.checkFeedback);
studentRouter.post("/feedback/:token", studentController.postFeedback);

module.exports = studentRouter;
