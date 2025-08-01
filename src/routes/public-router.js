const userController = require("../controllers/user-controller");
const { Router } = require("express");

const publicRouter = Router();

// GETS
publicRouter.get("/", (req, res, next) =>
  res.render("index", { title: "Home" })
);
publicRouter.get("/sign-up", userController.signUpGet);
publicRouter.get("/login", userController.loginGet);
publicRouter.get("/logout", userController.logoutGet);

// POSTS
publicRouter.post("/sign-up", userController.signUpPost);
publicRouter.post("/login", userController.loginPost);

module.exports = publicRouter;
