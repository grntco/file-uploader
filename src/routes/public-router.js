const userController = require("../controllers/user-controller");
const { Router } = require("express");

const publicRouter = Router();

publicRouter.get("/sign-up", userController.signUpGet);
publicRouter.get("/login", userController.loginGet);

module.exports = publicRouter;
