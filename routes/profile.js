const express = require("express");
const router = express.Router();

const prisma = require("../prisma");
const upload = require("../config/multer");
const handleUpload = require("../middlewares/handleUpload");
const isAuthenticated = require("../middlewares/isAuthenticated");

const multer = require("multer");

router.get("/", isAuthenticated, async (req, res) => {
  const allPosts = await prisma.post.findMany({
    where: {
      userId: req.user.id,
    },
  });
  console.log("All Posts:", allPosts);
  res.render("profilepage", {
    title: req.user.username,
    user: req.user,
    posts: allPosts,
  });
});

router.get('/view/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.render('profileView', { title: `${user.username}'s Profile`, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).send('Internal Server Error');
  }
});

router.get("/edit/:id", async (req, res) => {
  const { id } = req.params;
  const editProfile = await prisma.user.findUnique({
    where: {
      id,
    },
  });
  res.render("editprofile", {user: editProfile,});
});

router.put("/edit/:id", upload.single("photo"), async (req, res) => {
  try {
    if (req.body.username || req.body.number) {
      await prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          username: req.body.username,
          number: req.body.number,
        },
      });
    }

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const cldRes = await handleUpload(dataURI);

      await prisma.user.update({
        where: {
          id: req.user.id,
        },
        data: {
          photo: cldRes.secure_url,
        },
      });
    }

    res.redirect("/profile-page");
  } catch (error) {
    console.log(error);
    res.redirect("/home-page");
  }
});
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const findUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!findUser) {
      return res.status(404).send("User not found");
    }

    const userPosts = await prisma.post.findMany({
      where: {
        userId: findUser.id,
      },
    });

    res.render("profilepage", {
      title: "User Profile",
      user: findUser,
      posts: userPosts,
    });
  } catch (error) {
    console.error("Error fetching user or posts:", error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
