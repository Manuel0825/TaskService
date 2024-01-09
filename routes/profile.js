const express = require('express');
const router = express.Router();

const prisma = require('../prisma');
const upload = require('../config/multer');
const handleUpload = require('../middlewares/handleUpload');
const isAuthenticated= require ('../middlewares/isAuthenticated')



router.get('/profile-page:id', async (req, res) => {
  const { postId } = req.params;

  const findPost = await prisma.post.findUnique({
      where: {
          postId,
      },
  });

  res.render('postID', { title: findPost.title, post: findPost})
});


router.get("/profile-page", /*isAuthenticated,*/ async (req, res) => {
    const allPosts = await prisma.post.findMany({
      where: {
        userId: req.user.id
      },
    });
    console.log("All Posts:", allPosts);
    res.render("profilepage", { title: "posts", user: req.user, posts: allPosts });
  });


  


  
  
  /*router.get("/create", async (req, res) => {
    res.render("createForm", { title: "Create a post" });
  });*/
  


router.put('/', upload.single('photo'), async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
  
    const cldRes = await handleUpload(dataURI);
  
    const userUpdated = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        username: req.body.username,
        email: req.body.email,
        photo: cldRes.secure_url,
      },
    });
  
    res.redirect('/profile'); 
  } catch (error) {
    console.log(error);
    res.redirect('/profile');
  }
});


module.exports = router;