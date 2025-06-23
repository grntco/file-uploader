const getFileIcon = (mimeType = "") => {
  const iconsDir = "icons/";
  let fileIcon = "file-text.svg";

  if (mimeType.includes("image")) {
    fileIcon = "image.svg";
  } else if (mimeType.includes("audio")) {
    fileIcon = "music.svg";
  } else if (mimeType.includes("video")) {
    fileIcon = "film.svg";
  } else if (mimeType.includes("text")) {
    fileIcon = "file-text.svg";
  }

  return iconsDir + fileIcon;
};

module.exports = getFileIcon;
