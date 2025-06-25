const isAuth = require("../middleware/auth");
const fileController = require("../controllers/file-controller");
const folderController = require("../controllers/folder-controller");
const { Router } = require("express");
const protectedRouter = Router();

protectedRouter.use(isAuth);
// GETS
protectedRouter.get("/files", fileController.allFilesGet);
protectedRouter.get("/files/upload", fileController.uploadFilesGet);

protectedRouter.get("/folders", folderController.allFoldersGet);
protectedRouter.get("/folders/create", folderController.createFolderGet);

// POSTS
protectedRouter.post("/files/upload", fileController.uploadFilesPost);
protectedRouter.post("/folders/create", folderController.createFolderPost);

module.exports = protectedRouter;
