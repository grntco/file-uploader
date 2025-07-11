const setLocals = (req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.currentPath = req.path;

  const successFlashMsg = req.flash("success");
  res.locals.successFlashMsg =
    successFlashMsg.length > 0 ? successFlashMsg[0] : "";

  const errorFlashMsg = req.flash("error");
  res.locals.errorFlashMsg = errorFlashMsg.length > 0 ? errorFlashMsg[0] : "";

  next();
};

module.exports = setLocals;
