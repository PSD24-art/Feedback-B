const express = require("express");
const facultyRouter = express.Router();
const facultyController = require("../controller/facultyController");
const { isAuthenticated } = require("../middleware/middleware");
const { generateFacultyReport } = require("../utils/generateReport");

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
  getFacultyFeedbackTerms,
  getFacultyFeedbackLinks,
} = facultyController;

//Flow: faculty -> your subjects -> add subject -> generate Link (Link generated)
//Search subjects router
// subject routes with dept/sem
facultyRouter.post("/generate-report", generateFacultyReport);
facultyRouter.get(
  "/:id/subject/:dept/:sem",
  isAuthenticated,
  getSubjectWithDeptSem,
);
facultyRouter.get("/:id/subject/:dept", isAuthenticated, getSubjectWithDept);

facultyRouter
  .route("/:id/subject")
  .post(isAuthenticated, postSubject)
  .put(isAuthenticated, putSubject);

// Feedback links: list and create under same path, delete on param'd path
facultyRouter
  .route("/:id/feedback", isAuthenticated)
  .get(getFeedbackLink)
  .post(postFeedbackLink);

facultyRouter.delete(
  "/:id/feedback/:link",
  isAuthenticated,
  deleteFeedbackLink,
);

facultyRouter.get(
  "/:id/feedback/term",
  isAuthenticated,
  getFacultyFeedbackTerms,
);

facultyRouter.get("/:id/feedbacks", isAuthenticated, getFacultyFeedbackLinks);

facultyRouter.get(
  "/:id/count/:subject/:term",
  isAuthenticated,
  getFeedbackCount,
);
facultyRouter.get("/:id/tokens/:code", getToken);
facultyRouter.route("/:id/:term").get(isAuthenticated, getFaculty);

facultyRouter.post("/:id/faculty-summary", isAuthenticated, getFacultySummary);
module.exports = facultyRouter;
