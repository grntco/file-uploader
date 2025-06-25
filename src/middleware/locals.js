const setLocals = (req, res, next) => {
  res.locals.currentUser = req.user || null;
  // res.locals.currentPath = req.path;

  const successMsgFlash = req.flash("success");
  res.locals.successMsg = successMsgFlash.length > 0 ? successMsgFlash[0] : "";

  next();
};

module.exports = setLocals;
