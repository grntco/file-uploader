const multer = require("multer");
const upload = multer({ dest: "./src/uploads/" });
const prisma = require("../../prisma/prisma-client");
const path = require("node:path");
const fsPromises = require("fs").promises;
const formatFileData = require("../utils/format-file-data.js");

const allFilesGet = async (req, res, next) => {
  const files = await prisma.file.findMany({
    where: {
      userId: req.user.id,
    },
    orderBy: [
      {
        updatedAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  const formattedFiles = await Promise.all(
    files.map(async (file) => await formatFileData(file))
  );

  res.render("files", {
    title: "All Files",
    files: formattedFiles,
    errors: [],
  });
};

const singleFileGet = async (req, res, next) => {
  const id = parseInt(req.params.id);

  const file = await prisma.file.findUnique({
    where: { id },
  });

  if (!file || file.userId !== req.user.id) {
    return res.status(403).send("Forbidden");
  }

  const formattedFile = await formatFileData(file);
  const folders = await prisma.folder.findMany();

  console.log(formattedFile);
  res.render("single-file", { title: file.name, file: formattedFile, folders });
};

const uploadFilesGet = (req, res, next) => {
  res.render("upload", { title: "Upload Files" });
};

const uploadFilesPost = [
  upload.array("uploaded_files"),
  async (req, res, next) => {
    const files = req.files;

    if (!files || files.length === 0) {
      console.log("No files uploaded");
      return res.redirect("/files");
    }

    try {
      // Process all files in parallel
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          const oldPath = file.path;
          const newPath = path.join(file.destination, file.originalname);

          // Rename file
          await fsPromises.rename(oldPath, newPath);

          // Create database record
          // TODO: prisma.createMany for multiple files uploaded?
          const newFile = await prisma.file.create({
            data: {
              name: file.originalname,
              mimeType: file.mimetype,
              size: file.size,
              userId: req.user.id, // Assuming user is attached to req
            },
          });

          return newFile;
        })
      );

      console.log(`Successfully uploaded ${processedFiles.length} files`);
      res.redirect("/files");
    } catch (err) {
      console.error("Error processing files:", err);
      next(err);
    }
  },
];

const singleFileEditPost = async (req, res, next) => {
  const fileId = parseInt(req.params.id);
  const newFileName = req.body.name;

  if (newFileName || req.body.folderId) {
    try {
      const file = await prisma.file.findUnique({
        where: { id: fileId },
        select: { name: true },
      });
      const uploadsDir = path.join(__dirname, "../uploads/");

      if (file) {
        await fsPromises.rename(
          path.join(uploadsDir, file.name),
          path.join(uploadsDir, newFileName)
        );

        const folderId = parseInt(req.body.folderId) ?? null;

        await prisma.file.update({
          where: {
            id: fileId,
          },
          data: {
            name: newFileName,
            folderId: folderId,
          },
        });
      }

      res.redirect(`/files/${fileId}`);
    } catch (err) {
      console.error(err);
      next();
    }
  }
};

const deleteFilePost = async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (id) {
    try {
      const file = await prisma.file.findUnique({
        where: { id },
        select: { name: true },
      });
      const filePath = path.join(__dirname, "../uploads/", file.name);

      await fsPromises.unlink(filePath);
      await prisma.file.delete({ where: { id } });

      req.flash("success", "File successully deleted.");
    } catch (err) {
      console.error(err);
      next();
    }
    res.redirect("/files");
  }
};

module.exports = {
  allFilesGet,
  singleFileGet,
  uploadFilesGet,
  uploadFilesPost,
  singleFileEditPost,
  deleteFilePost,
};
