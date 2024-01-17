const express = require('express');
const router = express.Router();
const profileRoutes = require('./profile')
const postRoutes = require('./post')
const homeRoutes = require('./home')
const authRoutes = require ('./auth')



const isAuthenticated = require('../middlewares/isAuthenticated');

router.get('/', isAuthenticated, function(req, res, next) {
  res.render('index', { title: 'Express project template' });
});

router.use('/profile-page',profileRoutes);
router.use('/post-page', postRoutes);
router.use('/auth', authRoutes);
router.use('/home-page', homeRoutes);

module.exports = router;
