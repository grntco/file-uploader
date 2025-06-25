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

// locals
const setLocals = require("./src/middleware/locals");
app.use(setLocals);
// app.use((req, res, next) => {
//   res.locals.currentUser = req.user;
//   next();
// });

// ROUTES
const publicRouter = require("./src/routes/public-router");
const protectedRouter = require("./src/routes/protected-router");
app.use(publicRouter);
app.use(protectedRouter);

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
