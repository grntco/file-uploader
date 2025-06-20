const userController = require("../controllers/user-controller");
const { Router } = require("express");

const publicRouter = Router();

// GETS
publicRouter.get("/sign-up", userController.signUpGet);
publicRouter.get("/login", userController.loginGet);
// TODO: is the logout technically not public?
publicRouter.get("/logout", userController.logoutGet);

// POSTS
publicRouter.post("/sign-up", userController.signUpPost);
publicRouter.post("/login", userController.loginPost);

module.exports = publicRouter;
