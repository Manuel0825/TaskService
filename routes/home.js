const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/isAuthenticated");

router.get("/", isAuthenticated, (req, res) => {
  res.render("homepage", { title: "Home Page" , user: req.user });
});

module.exports = router;