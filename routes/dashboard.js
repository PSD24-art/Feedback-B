const express = require("express");
const dashboardRouter = express.Router();
const dashboardController = require("../controller/dashboardController");
const { isAuthenticated } = require("../middleware/middleware");

dashboardRouter.get(
  "/:id/terms",
  isAuthenticated,
  dashboardController.getFacultyTerms
);

module.exports = dashboardRouter;
