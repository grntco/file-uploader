const prisma = require("../../prisma/prisma-client");
const path = require("node:path");
const crypto = require("crypto");
const formatFileData = require("../utils/format-file-data.js");
const validateEditFile = require("../validation/edit-file-validator");
const { validationResult } = require("express-validator");
const upload = require("../config/multer-config.js");
const supabase = require("../config/supabase-config.js");

const allFilesGet = async (req, res, next) => {
  try {
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
  } catch (err) {
    console.error(
      "Error: Unable to load files for user with id ",
      req.user.id,
      ": ",
      err
    );

    res.render("files", {
      title: "All Files",
      files: [],
      errors: [
        "Unable to load your files at this time. Please refresh the page or try again later.",
      ],
    });
  }
};

const searchFilesGet = async (req, res, next) => {
  const query = req.query.q;

  try {
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
      title: files.length || query.length ? "Search Files" : "All Files",
      files: formattedFiles,
      searchText: query,
      errors: [],
    });
  } catch (err) {
    console.error(
      "Error: Unable to search files for user with id ,",
      req.user.id,
      " and query '",
      query,
      "': ",
      err
    );

    res.render("files", {
      title: "Search Files",
      files: [],
      searchText: query,
      errors: [
        "Unable to load files for your search query. Please try again later.",
      ],
    });
  }
};

const singleFileGet = async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (!id || isNaN(id)) {
    req.flash("error", "Invalid file id.");
    return res.redirect("/files");
  }

  try {
    const file = await prisma.file.findUnique({
      where: { id: id, userId: req.user.id },
    });

    if (!file) {
      return res.status(403).render("403", { title: "403: Forbidden" });
    }

    const formattedFile = await formatFileData(file);
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
    });

    res.render("single-file", {
      title: file.name,
      file: formattedFile,
      folders,
    });
  } catch (err) {
    console.error("Error: Unable to retrieve file with id ", id, ": ", err);

    res.render("single-file", {
      title: "",
      file: {},
      folders: [],
      errors: [
        "Unable to retrieve data for file requested. Please try again later.",
      ],
    });
  }
};

const downloadFileGet = async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (!id || isNaN(id)) {
    req.flash("error", "Invalid file ID.");
    return res.redirect("/files");
  }

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
};

// POSTS
const uploadFilesPost = [
  upload.array("uploaded_files"),
  async (req, res, next) => {
    const files = req.files;

    if (!files || files.length === 0) {
      console.error("Error: No files found to upload.");
      req.flash("error", "No files found to upload.");
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
            console.error("Error: Supabase upload error:", error);
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

      req.flash(
        "success",
        `Successfully uploaded ${processedFiles.length} file(s).`
      );
    } catch (err) {
      console.error("Error: An error occured while uploading files: ", err);
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

    if (!fileId || fileId === NaN) {
      req.flash("error", "File not found.");
      return res.redirect("/files");
    }

    if (newFileName || req.body.folderId) {
      try {
        const file = await prisma.file.findUnique({
          where: { id: fileId, userId: req.user.id },
          select: { uniqueName: true },
        });

        if (file) {
          const folderId = parseInt(req.body.folderId) ?? null;

          await prisma.file.update({
            where: {
              id: fileId,
              userId: req.user.id,
            },
            data: {
              name: newFileName,
              folderId: folderId,
            },
          });
        }
      } catch (err) {
        console.error("Error: Unable to edit file with id ", fileId, ": ", err);
      }
      res.redirect(`/files/${fileId}`);
    }
  },
];

const deleteFilePost = async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (!id || id === NaN) {
    req.flash("error", "File not found.");
    return res.redirect("/files");
  }

  try {
    const file = await prisma.file.findUnique({
      where: { id, userId: req.user.id },
      select: { name: true, uniqueName: true },
    });

    if (file) {
      // Delete from supabase storage
      const { data, error } = await supabase.storage
        .from("user-files")
        .remove([file.uniqueName]);

      if (error) {
        console.error("Error: Supabase deletion error: ", error);
        throw new Error(`Failed to delete ${file.name}: ${error.message}`);
      }

      // Delete from database
      await prisma.file.delete({ where: { id } });
      req.flash("success", "File successully deleted.");
    } else {
      throw new Error("Unable to find file with id ", id);
    }
  } catch (err) {
    console.error("Error deleting file:", err);
    req.flash("error", `Error deleting file: ${err}`);
  }
  res.redirect("/files");
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
