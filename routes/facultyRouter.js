const express = require("express");
const facultyRouter = express.Router();
const facultyController = require("../controller/facultyController");
const { isAuthenticated } = require("../middleware/middleware");

const {
  getFaculty,
  putSubject,
  getToken,
  postSubject,
  getSubjectWithDept,
  getSubjectWithDeptSem,
  postFeedbackLink,
  getFeedbackLink,
  deleteFeedbackLink,
  getFacultySummary,
  getFeedbackCount,
} = facultyController;

//Flow: faculty -> your subjects -> add subject -> generate Link (Link generated)
//Search subjects router
// subject routes with dept/sem
facultyRouter.get(
  "/:id/subject/:dept/:sem",
  isAuthenticated,
  getSubjectWithDeptSem
);
facultyRouter.get("/:id/subject/:dept", isAuthenticated, getSubjectWithDept);

facultyRouter
  .route("/:id/subject")
  .post(isAuthenticated, postSubject)
  .put(isAuthenticated, putSubject);

// Feedback links: list and create under same path, delete on param'd path
facultyRouter
  .route("/:id/feedback")
  .get(isAuthenticated, getFeedbackLink)
  .post(postFeedbackLink);

facultyRouter.delete(
  "/:id/feedback/:link",
  isAuthenticated,
  deleteFeedbackLink
);

facultyRouter.get("/:id/count/:subject", isAuthenticated, getFeedbackCount);
facultyRouter.get("/:id/tokens/:code", getToken);
facultyRouter.route("/:id").get(isAuthenticated, getFaculty);

facultyRouter.post("/:id/faculty-summary", isAuthenticated, getFacultySummary);
module.exports = facultyRouter;
