const multer = require("multer");
const upload = multer({ dest: "./src/uploads/" });
const prisma = require("../../prisma/prisma-client");
const path = require("node:path");
const fsPromises = require("fs").promises;
const formatFileData = require("../utils/format-file-data.js");
const validateEditFile = require("../validation/edit-file-validator");
const { validationResult } = require("express-validator");

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

const searchFilesGet = async (req, res, next) => {
  const query = req.query.q;

  const files = await prisma.file.findMany({
    where: {
      name: { contains: query, mode: "insensitive" },
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
    title: files.length ? "Search Files" : "All Files",
    files: formattedFiles,
    searchText: query,
    errors: [],
  });
};

const singleFileGet = async (req, res, next) => {
  const id = parseInt(req.params.id);

  const file = await prisma.file.findUnique({
    where: { id },
  });

  if (!file || file.userId !== req.user.id) {
    return res.status(403).render("403", { title: "403: Forbidden" });
  }

  const formattedFile = await formatFileData(file);
  const folders = await prisma.folder.findMany({
    where: { userId: req.user.id },
  });

  res.render("single-file", { title: file.name, file: formattedFile, folders });
};

const downloadFileGet = async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (id) {
    try {
      const file = await prisma.file.findUnique({
        where: { id },
        select: { name: true },
      });

      if (file.userId !== req.user.id) {
        return res.status(403).render("403", { title: "403: Forbidden" });
      }

      if (!file) {
        req.flash("error", "File not found.");
        return res.redirect("/files");
      }

      const filePath = path.join(__dirname, "../uploads/", file.name);

      res.download(filePath, (err) => {
        if (err) {
          req.flash("error", "File not found or cannot be downloaded.");
          return res.redirect("/files");
        }
      });
    } catch (err) {
      console.error(err);
      next();
    }
  }
};

// POSTS
const uploadFilesPost = [
  upload.array("uploaded_files"),
  async (req, res, next) => {
    const files = req.files;

    if (!files || files.length === 0) {
      console.log("No files uploaded");
      req.flash("error", "No files uploaded.");
      return res.redirect("/files");
    }

    try {
      const processedFiles = await Promise.all(
        files.map(async (file) => {
          const oldPath = file.path;
          const newPath = path.join(file.destination, file.originalname);

          await fsPromises.rename(oldPath, newPath);

          // Create database record
          // TODO: prisma.createMany for multiple files uploaded?
          const newFile = await prisma.file.create({
            data: {
              name: file.originalname,
              mimeType: file.mimetype,
              size: file.size,
              userId: req.user.id,
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

const singleFileEditPost = [
  validateEditFile,
  async (req, res, next) => {
    const fileId = parseInt(req.params.id);
    const newFileName = req.body.name;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      const files = await prisma.file.findMany({
        where: { userId: req.user.id },
      });

      const formattedFiles = await Promise.all(
        files.map(async (file) => await formatFileData(file))
      );

      return res.status(400).render("files", {
        title: "All Files",
        files: formattedFiles,
        errors: errors.array(),
      });
    }

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
  },
];

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
  searchFilesGet,
  singleFileGet,
  downloadFileGet,
  uploadFilesPost,
  singleFileEditPost,
  deleteFilePost,
};
