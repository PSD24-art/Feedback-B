const express = require("express");
const facultyRouter = express.Router();
const facultyController = require("../controller/facultyController");
const { isAuthenticated } = require("../middleware/middleware");

const {
  getFaculty,
  putSubject,
  getToken,
  getSubject,
  postSubject,
  getSubjectWithDept,
  getSubjectWithDeptSem,
  postFeedbackLink,
  getFeedbackLink,
  deleteFeedbackLink,
  getFeedbackCount,
} = facultyController;

//Flow: faculty -> your subjects -> add subject -> generate Link (Link generated)

//fetches faculty and subject data of the faculty
facultyRouter.get("/faculties/:id", isAuthenticated, getFaculty);
//Get all subjects
facultyRouter.get("/faculties/:id/subject", isAuthenticated, getSubject);
//Add new subject in DB
facultyRouter.post("/faculties/:id/subject", isAuthenticated, postSubject);
//Add subject for feedback form and insert faculty id to it
facultyRouter.put("/faculties/:id/subject", isAuthenticated, putSubject);

//Feedback link adding to db
facultyRouter.post("/faculties/:id/feedback", postFeedbackLink);
//Get all feedback links
facultyRouter.get("/faculties/:id/feedback", isAuthenticated, getFeedbackLink);
//Delete Faculty link
facultyRouter.delete(
  "/faculties/:id/feedback/:link",
  isAuthenticated,
  deleteFeedbackLink
);
//Search subjects router
facultyRouter.get(
  "/faculties/:id/subject/:dept",
  isAuthenticated,
  getSubjectWithDept
);
facultyRouter.get(
  "/faculties/:id/subject/:dept/:sem",
  isAuthenticated,
  getSubjectWithDeptSem
);
//Fetches the count for feedbacks submitted agianst the same faculty and subject
facultyRouter.get(
  "/faculties/:id/count/:subject",
  isAuthenticated,
  getFeedbackCount
);
//This module creates a unique link
facultyRouter.get("/faculties/:id/tokens/:code", getToken);

module.exports = facultyRouter;
