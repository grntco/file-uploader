require("dotenv").config();
const express = require("express");
const path = require("node:path");
const passport = require("./src/config/passport-config");
const PORT = process.env.PORT || 3000;
const sessionConfig = require("./src/config/session-config");

const app = express();
app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(sessionConfig);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

// ROUTES
// Public router
const publicRouter = require("./src/routes/public-router");
app.use(publicRouter);
// Auth Router
app.get("/", (req, res, next) => {
  res.render("index", { title: "Home" });
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
