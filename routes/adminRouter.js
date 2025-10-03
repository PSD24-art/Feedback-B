const express = require("express");
const adminRouter = express.Router();
const adminController = require("../controller/adminController");
const { isAuthenticated, isAdmin } = require("../middleware/middleware");

//Flow: admin dashboard(see all faculties with thier names and subjects) -> clicks a faculty to deep dive into his analytics -> sidebar (has options to
// add a faculty, remove faculty)

const {
  getFaculties,
  postFaculty,
  getOneFaculty,
  deleteFaculty,
  getFeedbackLinkAdmin,
  getFeedbackCountAdmin,
} = adminController;

//get admin details
adminRouter.get("/admin/:id", isAuthenticated, isAdmin, getFaculties);
//get all faculties

//by clicking individual faculty admin redirects to link get-/faculty/:id

//get faculty
adminRouter.get(
  "/admin/faculties/:id",
  isAuthenticated,
  isAdmin,
  getOneFaculty
);
//Faculty Created Links
adminRouter.get(
  "/admin/faculties/:id/links",
  isAdmin,
  isAuthenticated,
  getFeedbackLinkAdmin
);
//Faculty feedback details
adminRouter.get(
  "/admin/faculties/:id/feedback/:subject",
  isAdmin,
  isAuthenticated,
  getFeedbackCountAdmin
);
//add faculty
adminRouter.post("/admin/faculties/new", isAuthenticated, isAdmin, postFaculty);

//delete faculty
adminRouter.delete(
  "/admin/faculties/:id",
  isAuthenticated,
  isAdmin,
  deleteFaculty
);

module.exports = adminRouter;
