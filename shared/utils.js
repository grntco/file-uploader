const formatBytes = (bytes, decimals) => {
  if (bytes == 0) return "0 Bytes";
  var k = 1024,
    dm = decimals || 2,
    sizes = ["bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"],
    i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { formatBytes };
}

// For browsers (client-side) - make it global
if (typeof window !== "undefined") {
  window.formatBytes = formatBytes;
}
