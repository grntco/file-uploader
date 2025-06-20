const isAuth = require("../middleware/auth");
const { Router } = require("express");
const protectedRouter = Router();

protectedRouter.get("/", isAuth, (req, res, next) =>
  res.render("index", { title: "Home" })
);

module.exports = protectedRouter;
