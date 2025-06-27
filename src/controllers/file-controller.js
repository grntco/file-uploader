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
    where: {
      id,
    },
  });

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

module.exports = {
  allFilesGet,
  singleFileGet,
  uploadFilesGet,
  uploadFilesPost,
};
