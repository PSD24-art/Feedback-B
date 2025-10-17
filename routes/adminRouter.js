const express = require("express");
const adminRouter = express.Router();
const adminController = require("../controller/adminController");
const { isAdmin } = require("../middleware/middleware");

//Flow: admin dashboard(see all faculties with thier names and subjects) -> clicks a faculty to deep dive into his analytics -> sidebar (has options to
// add a faculty, remove faculty)

const {
  getFaculties,
  postFaculty,
  getOneFaculty,
  deleteFaculty,
  getFeedbackLinkAdmin,
  getFeedbackCountAdmin,
  getFacultySummary,
} = adminController;

//get admin details
adminRouter.get("/:id", isAdmin, getFaculties);
//get all faculties

//by clicking individual faculty admin redirects to link get-/faculty/:id

//get faculty
adminRouter.get(
  "/:id/faculties/:facultyId",

  isAdmin,
  getOneFaculty
);
//Faculty Created Links
adminRouter.get(
  "/:id/faculties/:facultyId/links",
  isAdmin,

  getFeedbackLinkAdmin
);
//Faculty feedback details
adminRouter.get(
  "/:id/faculties/:facultyId/feedback/:subject",
  isAdmin,

  getFeedbackCountAdmin
);
//add faculty
adminRouter.post("/:id/faculties/new", isAdmin, postFaculty);

//delete faculty
adminRouter.delete("/:id/faculties/:facultyId", isAdmin, deleteFaculty);

adminRouter.post("/:id/faculty-summary", isAdmin, getFacultySummary);

module.exports = adminRouter;
