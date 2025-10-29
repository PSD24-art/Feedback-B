const express = require("express");
const { isSuperAdmin } = require("../middleware/middleware");
const { getRequests } = require("../controller/superAdminController");
const superAdminRouter = express.Router();

superAdminRouter.get("/:id", isSuperAdmin, getRequests);

module.exports = superAdminRouter;
