const prisma = require("../../prisma/prisma-client");
const path = require("node:path");
const crypto = require("crypto");
const fsPromises = require("fs").promises;
const formatFileData = require("../utils/format-file-data.js");
const validateEditFile = require("../validation/edit-file-validator");
const { validationResult } = require("express-validator");
const upload = require("../config/multer-config.js");
const supabase = require("../config/supabase-config.js");

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
        select: { userId: true, name: true, uniqueName: true },
      });

      if (!file) {
        req.flash("error", "File not found in database.");
        return res.redirect("/files");
      }

      if (file.userId !== req.user.id) {
        return res.status(403).render("403", { title: "403: Forbidden" });
      }

      // Download from supabase
      const { data, error } = await supabase.storage
        .from("user-files")
        .createSignedUrl(file.uniqueName, 3600, {
          download: file.name,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        throw new Error(`Failed to download ${file.name}: ${error.message}`);
      }

      return res.redirect(data.signedUrl);
    } catch (err) {
      console.error(err);
      req.flash("error", "An error occurred when downloading a file.");
      return res.redirect("/files");
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
          const uniqueName =
            crypto.randomUUID() + path.extname(file.originalname);

          const { data, error } = await supabase.storage
            .from("user-files")
            .upload(uniqueName, file.buffer);

          if (error) {
            console.error("Supabase upload error:", error);
            throw new Error(
              `Failed to upload ${file.originalname}: ${error.message}`
            );
          }

          const newFile = await prisma.file.create({
            data: {
              name: file.originalname,
              uniqueName: uniqueName,
              mimeType: file.mimetype,
              size: file.size,
              userId: req.user.id,
            },
          });

          return newFile;
        })
      );

      console.log(`Successfully uploaded ${processedFiles.length} files`);
      req.flash(
        "success",
        `Successfully uploaded ${processedFiles.length} file(s).`
      );
    } catch (err) {
      console.error("Error processing files:", err);
      req.flash("error", "An error occurred while uploading files.");
    }

    res.redirect("/files");
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
          select: { uniqueName: true },
        });

        if (file) {
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
        select: { name: true, uniqueName: true },
      });

      // Delete from supabase storage
      const { data, error } = await supabase.storage
        .from("user-files")
        .remove([file.uniqueName]);

      if (error) {
        console.error("Supabase deletion error:", error);
        throw new Error(`Failed to delete ${file.name}: ${error.message}`);
      }

      // Delete from database
      await prisma.file.delete({ where: { id } });

      req.flash("success", "File successully deleted.");
    } catch (err) {
      console.error("Error deleting file:", err);
      req.flash("error", `Error deleting file: ${err}`);
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
