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
const facultyRouter = require("./routes/facultyRouter");
const adminRouter = require("./routes/adminRouter");
const loginRouter = require("./routes/login");
const Faculty = require("./models/faculty");
const { isAuthenticated } = require("./middleware/middleware");

const app = express();

// Trust proxy
app.set("trust proxy", 1);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://localhost:5173", "https://feedback-guru-f.onrender.com"],
    credentials: true,
  })
);

// Session
const isProduction = process.env.NODE_ENV === "production";
const sessionOptions = {
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions",
    ttl: 7 * 24 * 60 * 60,
  }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  },
};
app.use(session(sessionOptions));

// Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(Faculty.authenticate()));
passport.serializeUser(Faculty.serializeUser());
passport.deserializeUser(Faculty.deserializeUser());

// DB
const DB_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;
mongoose
  .connect(DB_URI)
  .then(() => console.log("Database Connected"))
  .catch((err) => console.error("DB Connection Error:", err));

// Routes
app.get("/", (req, res) => {
  console.log(req);
  res.send("Root is working");
});

app.get("/api/me", isAuthenticated, (req, res) => {
  res.json({ user: req.user });
});

app.use("/api", loginRouter);
app.use("/api", adminRouter);
app.use("/api", studentRouter);
app.use("/api", facultyRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

app.listen(PORT, () => {
  console.log(`server is running on http://localhost:${PORT}`);
});
