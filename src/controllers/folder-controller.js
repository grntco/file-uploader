const prisma = require("../../prisma/prisma-client");
const formatFolderData = require("../utils/format-folder-data");

const allFoldersGet = async (req, res, next) => {
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
};

const createFolderGet = (req, res, next) => {
  res.render("create-folder", { title: "Create Folder" });
};

const createFolderPost = async (req, res, next) => {
  const newFolder = await prisma.folder.create({
    data: {
      name: req.body.name,
      userId: req.user.id,
    },
  });

  console.log(newFolder);
  res.redirect("/folders");
};

module.exports = {
  allFoldersGet,
  createFolderGet,
  createFolderPost,
};
