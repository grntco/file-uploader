const filesGet = (req, res, next) => {
  res.render("files", { title: "All Files" });
};

const newFilePost = (req, res, next) => {
  
}

module.exports = {
  filesGet,
};
