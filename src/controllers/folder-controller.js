const prisma = require("../../prisma/prisma-client");
const formatFolderData = require("../utils/format-folder-data");
const formatFileData = require("../utils/format-file-data");
const validateFolder = require("../validation/folder-validator");
const { validationResult } = require("express-validator");

const allFoldersGet = async (req, res, next) => {
  try {
    const folders = await prisma.folder.findMany({
      where: { userId: req.user.id },
    });

    const formattedFolders = await Promise.all(
      folders.map(async (folder) => await formatFolderData(folder))
    );

    res.render("folders", {
      title: "All Folders",
      folders: formattedFolders,
      errors: [],
    });
  } catch (err) {
    console.error(
      "Error: Unable to load folders for user with id ",
      req.user.id,
      ": ",
      err
    );

    res.render("folders", {
      title: "All Folders",
      folders: [],
      errors: [
        "Unable to load your folders at this time. Please refresh the page or try again later.",
      ],
    });
  }
};

const singleFolderGet = async (req, res, next) => {
  const folderId = parseInt(req.params.id);

  if (!folderId || isNaN(folderId)) {
    req.flash("error", "Invalid folder id.");
    return res.redirect("/folders");
  }

  try {
    const folder = await prisma.folder.findUnique({
      where: { id: folderId, userId: req.user.id },
    });

    if (!folder) {
      return res.status(403).render("403", { title: "403: Forbidden" });
    }

    const files = await prisma.file.findMany({
      where: { folderId },
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
      title: folder.name,
      folder: folder,
      files: formattedFiles,
      errors: [],
    });
  } catch (err) {
    console.error(
      "Error: Unable to load contents for folder with id ",
      folderId,
      ": ",
      err
    );

    // TODO: how to get all folders?
    res.render("folders", {
      title: "All Folders",
      folders: [],
      errors: [
        "Unable to load contents for that folder at this time. Please refresh the page or try again later.",
      ],
    });
  }
};

// POSTS
const createFolderPost = [
  validateFolder,
  async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors);
      const folders = await prisma.folder.findMany({
        where: { userId: req.user.id },
      });

      const formattedFolders = await Promise.all(
        folders.map(async (folder) => await formatFolderData(folder))
      );

      return res.status(400).render("folders", {
        title: "All Folders",
        folders: formattedFolders,
        errors: errors.array(),
      });
    }

    try {
      await prisma.folder.create({
        data: {
          name: req.body.name,
          userId: req.user.id,
        },
      });

      req.flash("success", `Successfully created new folder ${req.body.name}.`);
    } catch (err) {
      console.error("Error: Unable to create new folder.");
      req.flash(
        "error",
        "Unable to create a new folder at this time. Please try again later."
      );
    }
    res.redirect("/folders");
  },
];

const editFolderPost = [
  validateFolder,
  async (req, res, next) => {
    const errors = validationResult(req);
    const id = parseInt(req.params.id);

    if (!id || isNaN(id)) {
      req.flash("error", "Invalid folder ID.");
      return res.redirect("/folders");
    }

    const folder = await prisma.folder.findFirst({
      where: {
        id: id,
        userId: req.user.id,
      },
    });

    if (!folder) {
      req.flash(
        "error",
        "Folder not found or you don't have permission to edit it."
      );
      return res.redirect("/folders");
    }

    if (!errors.isEmpty()) {
      console.log(errors);

      const files = await prisma.file.findMany({
        where: { folderId: id },
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      });

      const formattedFiles = await Promise.all(
        files.map(async (file) => await formatFileData(file))
      );

      return res.status(400).render("files", {
        title: folder.name,
        folder: folder,
        files: formattedFiles,
        errors: errors.array(),
      });
    }

    try {
      await prisma.folder.update({
        where: { id },
        data: { name: req.body.name },
      });
      req.flash("success", "Folder name successfully edited.");
    } catch (err) {
      console.error("Error: Unable to update folder: ", err);
      req.flash("error", "An error occurred while updating the folder.");
    }

    res.redirect("/folders");
  },
];

const deleteFolderPost = async (req, res, next) => {
  const id = parseInt(req.params.id);

  if (!id || isNaN(id)) {
    req.flash("error", "Invalid folder ID.");
    return res.redirect("/folders");
  }

  const folder = await prisma.folder.findFirst({
    where: {
      id: id,
      userId: req.user.id,
    },
  });

  if (!folder) {
    req.flash(
      "error",
      "Folder not found or you don't have permission to delete it."
    );
    return res.redirect("/folders");
  }

  try {
    await prisma.folder.delete({ where: { id } });
    req.flash(
      "success",
      "Folder successfully deleted. Any files in that folder are still safe."
    );
  } catch (err) {
    console.error("Error deleting folder: ", err);
    req.flash("error", "An error occurred while deleting the folder.");
  }
  res.redirect("/folders");
};

module.exports = {
  allFoldersGet,
  singleFolderGet,
  createFolderPost,
  editFolderPost,
  deleteFolderPost,
};
