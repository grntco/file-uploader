const multer = require("multer");
const upload = multer({ dest: "./src/uploads/" });
const prisma = require("../../prisma/prisma-client");
const path = require("node:path");
const fsPromises = require("fs").promises;
const { format } = require("date-fns");

const filesGet = async (req, res, next) => {
  const files = await prisma.file.findMany({
    where: {
      userId: req.user.id,
    },
  });

  // Format the files with easy-to-read dates and attach folders
  const formattedFiles = await Promise.all(
    files.map(async (file) => {
      const formatted = {
        ...file,
        createdAt: format(new Date(file.createdAt), "PPp"),
        updatedAt: format(new Date(file.updatedAt), "PPp"),
      };

      if (file.folderId) {
        const folder = await prisma.folder.findFirst({
          where: { id: file.folderId },
        });
        formatted.folderId = folder?.id;
        formatted.folderName = folder?.name;
      }

      return formatted;
    })
  );

  res.render("files", { title: "All Files", files: formattedFiles });
};

const uploadFilesGet = (req, res, next) => {
  res.render("upload", { title: "Upload Files" });
};

const uploadFilesPost = [
  upload.single("uploaded_file"),
  async (req, res, next) => {
    if (!req.file) {
      console.log("No file uploaded");
      return res.redirect("/files");
    }

    const oldPath = req.file.path;
    const newPath = path.join(req.file.destination, req.file.originalname);

    try {
      await fsPromises.rename(oldPath, newPath);

      const newFile = await prisma.file.create({
        data: {
          name: req.file.originalname,
          userId: req.user.id,
        },
      });

      console.log(newFile);
      res.redirect("/files");
    } catch (err) {
      next(err);
    }
  },
];

module.exports = {
  filesGet,
  uploadFilesGet,
  uploadFilesPost,
};
