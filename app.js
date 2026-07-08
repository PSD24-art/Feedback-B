// External Modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
require("dotenv").config();
const LocalStrategy = require("passport-local");
const MongoStore = require("connect-mongo");

// Local Modules
const studentRouter = require("./routes/studentRouter");
const dashboardRouter = require("./routes/dashboard");
const facultyRouter = require("./routes/facultyRouter");
const adminRouter = require("./routes/adminRouter");
const loginRouter = require("./routes/login");
const Faculty = require("./models/faculty");
const { isAuthenticated } = require("./middleware/middleware");
const User = require("./models/user");
const superAdminRouter = require("./routes/superAdminRouter");
const Institute = require("./models/institute");
const InstituteRequest = require("./models/instituteRequests");

const app = express();

// Trust proxy
app.set("trust proxy", 1);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const FRONTEND_URL = process.env.FRONTEND_URL;
app.use(
  cors({
    origin: [FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
  }),
);

// Session

app.use(
  session({
    name: "feedback.sid",
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    proxy: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 7 * 24 * 60 * 60,
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false, //  FORCE TRUE
      sameSite: "lax", //  FORCE NONE
    },
  }),
);

// Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// DB
const DB_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;
mongoose
  .connect(DB_URI)
  .then(() => console.log("Database Connected"))
  .catch((err) => console.error("DB Connection Error:", err));

// Routes
app.get("/", (req, res) => {
  // console.log(req);
  res.send("Root is working");
});

app.get("/api/me", isAuthenticated, (req, res) => {
  res.json({ user: req.user });
});

app.use("/api/faculty", facultyRouter);
app.use("/api/admin", adminRouter);
app.use("/api/superAdmin", superAdminRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api", studentRouter);
app.use("/api", loginRouter);

app.post("/api/instituteRequest", async (req, res) => {
  const { formData } = req.body;
  try {
    if (!formData) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const existingData = await Institute.findOne({ name: formData.name });

    if (existingData) {
      return res.status(404).json({ message: "Institute already Exists" });
    }

    const newInstitute = new InstituteRequest({
      name: formData.name,
      code: formData.code,
      contactInfo: {
        email: formData.contactInfo.email,
        phone: formData.contactInfo.phone,
        website: formData.contactInfo.website,
      },
      address: formData.address,
      contactPerson: {
        name: formData.contactPerson.name,
        mobile: formData.contactPerson.mobile,
        email: formData.contactPerson.email,
      },
    });

    const savedInstitute = await newInstitute.save();
    console.log("Saved Institute:", savedInstitute);

    res.status(201).json({
      success: true,
      message: "Institute request submitted successfully!",
      data: savedInstitute,
    });
  } catch (e) {
    console.error("Error saving institute:", e);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
