const isAuth = require("../middleware/auth");
const fileController = require("../controllers/file-controller");
const folderController = require("../controllers/folder-controller");
const { Router } = require("express");
const protectedRouter = Router();

protectedRouter.use(isAuth);
// GETS
protectedRouter.get("/files", fileController.allFilesGet);
protectedRouter.get("/files/search", fileController.searchFilesGet);
protectedRouter.get("/files/:id/download", fileController.downloadFileGet);
protectedRouter.get("/files/:id", fileController.singleFileGet);

// protectedRouter.get("/upload", fileController.uploadFilesGet);

protectedRouter.get("/folders", folderController.allFoldersGet);
protectedRouter.get("/folders/:id", folderController.singleFolderGet);
// protectedRouter.get("/folders/create", folderController.createFolderGet);

// POSTS
protectedRouter.post("/upload", fileController.uploadFilesPost);

protectedRouter.post("/files/:id/edit", fileController.singleFileEditPost);
protectedRouter.post("/files/:id/delete", fileController.deleteFilePost);

protectedRouter.post("/folders/new", folderController.createFolderPost);

module.exports = protectedRouter;
