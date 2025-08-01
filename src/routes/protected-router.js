const isAuth = require("../middleware/auth");
const fileController = require("../controllers/file-controller");
const folderController = require("../controllers/folder-controller");
const { Router } = require("express");
const protectedRouter = Router();

protectedRouter.use(isAuth);
// GETS
// Files
protectedRouter.get("/files", fileController.allFilesGet);
protectedRouter.get("/files/search", fileController.searchFilesGet);
protectedRouter.get("/files/:id/download", fileController.downloadFileGet);
protectedRouter.get("/files/:id", fileController.singleFileGet);

// Folders
protectedRouter.get("/folders", folderController.allFoldersGet);
protectedRouter.get("/folders/:id", folderController.singleFolderGet);

// POSTS
// Files
protectedRouter.post("/upload", fileController.uploadFilesPost);
protectedRouter.post("/files/:id/edit", fileController.singleFileEditPost);
protectedRouter.post("/files/:id/delete", fileController.deleteFilePost);

// Folders
protectedRouter.post("/folders", folderController.createFolderPost);
protectedRouter.post("/folders/:id/delete", folderController.deleteFolderPost);

module.exports = protectedRouter;
