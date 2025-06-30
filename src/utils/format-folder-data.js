const prisma = require("../../prisma/prisma-client");
const { format } = require("date-fns");

const formatFolderData = async (folder) => {
  const filesCount = await prisma.file.count({
    where: { folderId: folder.id },
  });

  return {
    ...folder,
    displayCreatedAt: format(new Date(folder.createdAt), "PP"),
    displayUpdatedAt: format(new Date(folder.updatedAt), "PP"),
    filesCount: filesCount,
  };
};

module.exports = formatFolderData;
