const multer = require("multer");
const upload = multer({ dest: "./src/uploads/" });
const prisma = require("../../prisma/prisma-client");

const filesGet = async (req, res, next) => {
  const files = await prisma.file.findMany({
    where: {
      userId: req.user.id,
    },
  });

  console.log(files);

  res.render("files", { title: "All Files", files: files });
};

const uploadFilesGet = (req, res, next) => {
  res.render("upload", { title: "Upload Files" });
};

const uploadFilesPost = [
  upload.single("uploaded_file"),
  async (req, res, next) => {
    if (req.file) {
      const newFile = await prisma.file.create({
        data: {
          name: req.file.originalname,
          userId: req.user.id,
        },
      });

      console.log(newFile);
    } else {
      console.log("no file uploaded");
    }
    res.redirect("/files");
  },
];

module.exports = {
  filesGet,
  uploadFilesGet,
  uploadFilesPost,
};
