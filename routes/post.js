require("dotenv").config();
const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const passport = require("passport");
const upload = require("../config/multer");
const handleUpload = require("../middlewares/handleUpload");




const prisma = require("../prisma");


router.get("/filter", isAuthenticated, async (req, res) => {
  const { category } = req.query;

  let posts;

  if (category) {
    // Filter posts by category if category parameter is present
    posts = await prisma.post.findMany({
      where: {
        category: {
          contains: category,
        },
      },
    });
  } else {
    // Fetch all posts if no category parameter
    posts = await prisma.post.findMany({});
  }

  res.render("posts", { title: "All Posts", posts });
});


router.get("/create", isAuthenticated , async (req, res) => {
  res.render("createForm", { title: "Create a post" });
});



router.post("/create",isAuthenticated, upload.single('photo'), async (req, res) => {
    try {
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
  
      const cldRes = await handleUpload(dataURI);
  
  
   await prisma.post.create({
    data: {
      title: req.body.title,
      content: req.body.content,
      category: req.body.category,
      photo : cldRes.secure_url,
      userId: req.user.id,
      },
  });
  res.redirect("/post-page/filter");
}catch (error){
  console.log (error);
  res.redirect("/home-page");
  }});



router.get("/update/:postId", isAuthenticated,async (req, res) => {
  const { postId } = req.params;
   const updateId = await prisma.post.findUnique({
    where: {
      postId,
    },
  });

  res.render("editForm", { title: updateId.title, post: updateId });
});

router.put("/update/:postId", isAuthenticated,upload.single('photo'), async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    const cldRes = await handleUpload(dataURI);

    const { postId } = req.params;
    await prisma.post.update({
      where: {
        postId,
      },
      data: {
        ...req.body,
        photo: cldRes.secure_url,
      },
    });

    res.redirect("/profile-page");
  } catch (error) {
    console.log(error);
    res.redirect("/home-page");
  }
});


router.delete('/delete/:postId', async(req, res) => {
  const {postId} = req.params;

  await prisma.post.delete({
      where: {
          postId,
      },
  });
  res.redirect('/profile-page');
});

router.get('/:postId',isAuthenticated, async (req, res) => {
  try {
    const { postId } = req.params;

    const findPost = await prisma.post.findUnique({
      where: {
        postId,
      },
    });

    if (!findPost) {
      return res.status(404).send('Post not found');
    }

    const user = await prisma.user.findUnique({
      where: {
        id: findPost.userId,
      },
    });

    const isPostCreator = req.user.id === user.id;

    res.render('postID', { title: 'Post Details', post: findPost, user, isPostCreator });
  } catch (error) {
    console.error('Error fetching post or user:', error);
    res.status(500).send('Internal Server Error');
  }
});





module.exports = router;