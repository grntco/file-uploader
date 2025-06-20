const isAuth = require("../middleware/auth");
const fileController = require("../controllers/file-controller");
const { Router } = require("express");
const protectedRouter = Router();

// GETS
// Might make the home / public, like a landing page
protectedRouter.use(isAuth);
protectedRouter.get("/", (req, res, next) =>
  res.render("index", { title: "Home" })
);

protectedRouter.get("/files", fileController.filesGet);
protectedRouter.get("/files/upload", fileController.uploadFilesGet);

// POSTS
protectedRouter.post("/files/upload", fileController.uploadFilesPost);

module.exports = protectedRouter;
