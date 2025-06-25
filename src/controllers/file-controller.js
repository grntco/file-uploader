const multer = require("multer");
const upload = multer({ dest: "./src/uploads/" });
const prisma = require("../../prisma/prisma-client");
const path = require("node:path");
const fsPromises = require("fs").promises;
const { format } = require("date-fns");
const { formatBytes } = require("../../shared/utils.js");
const getFileIcon = require("../utils/get-file-icon");

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

  // Format the files with easy-to-read dates and attach folders
  const formattedFiles = await Promise.all(
    files.map(async (file) => {
      const formatted = {
        ...file,
        createdAt: format(new Date(file.createdAt), "PP"),
        updatedAt: format(new Date(file.updatedAt), "PP"),
        size: formatBytes(Number(file.size)),
        icon: getFileIcon(file.mimeType),
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

  res.render("files", {
    title: "All Files",
    files: formattedFiles,
    errors: [],
  });
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
  uploadFilesGet,
  uploadFilesPost,
};
