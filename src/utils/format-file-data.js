const { format } = require("date-fns");
const { formatBytes } = require("../../shared/utils");
const getFileIcon = require("./get-file-icon.js");
const prisma = require("../../prisma/prisma-client.js");

const formatFileData = async (file) => {
  const formatted = {
    ...file,
    displayCreatedAt: format(new Date(file.createdAt), "PP"),
    displayUpdatedAt: format(new Date(file.updatedAt), "PP"),
    displaySize: formatBytes(Number(file.size)),
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
};

module.exports = formatFileData;
