const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const passport = require("passport");
const prisma = require("../prisma");

const transporter = require ("../config/nodemailer")

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user by saving their email and hashed password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password.
 *     responses:
 *       302:
 *         description: Redirects to the login page on success.
 *       500:
 *         description: Redirects to the registration page on error.
 */
router.post("/register-page", async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = await prisma.user.create({
      data: {
        email: req.body.email,
        password: hashedPassword,
      },
    });
    
    let mailOptions = {
      from: 'TercerProyecto',
      to: req.body.email,
      subject: 'Asunto del Email',
      text: `Welcome ${newUser.username}`  // o puedes usar `html` para contenido HTML
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          console.log(error);
      } else {
          console.log('Correo enviado: ' + info.response);
      }
  });
    
  res.redirect("/auth/login-page");
  } catch (error) {
    console.log(error);
    res.redirect("/auth/register-page");
  }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Authenticate user
 *     description: Logs in a user using email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password.
 *     responses:
 *       302:
 *         description: Redirects to the home page on success, login page on failure.
 */
router.post(
  "/login-page",
  passport.authenticate("local", {
    successRedirect: "/home-page",
    failureRedirect: "/login-page",
    failureFlash: true,
  })
);

/**
 * @swagger
 * /auth/login-page:
 *   get:
 *     summary: Login page
 *     description: Renders the login page.
 *     responses:
 *       200:
 *         description: Returns the login page.
 */
router.get("/login-page", (req, res) => {
  res.render("login", { error: req.flash("error") });
});

/**
 * @swagger
 * /auth/register-page:
 *   get:
 *     summary: Registration page
 *     description: Renders the registration page.
 *     responses:
 *       200:
 *         description: Returns the registration page.
 */
router.get("/register-page", (req, res) => {
  res.render("register", { error: req.flash("error") });
});

router.get('/profile-page', (req, res) => {
  // Check if the user is authenticated
  if (req.isAuthenticated()) {
    // Render the profile page and pass the user data to the template
    res.render('profilepage', { user: req.user });
  } else {
    // Redirect to the login page if the user is not authenticated
    res.redirect('/auth/login-page');
  }
});



router.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/auth/login-page");
  });
});

module.exports = router;
