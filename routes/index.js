const express = require('express');
const router = express.Router();
const profileRoutes = require('./profile')
const postRoutes = require('./post')
const homeRoutes = require('./home')



/*const isAuthenticated = require('../middlewares/isAuthenticated');

router.get('/', isAuthenticated, function(req, res, next) {
  res.render('index', { title: 'Express project template' });
});*/

router.use('/',profileRoutes);
router.use('/', postRoutes);
router.use('/', require('./auth'));
router.use('/', homeRoutes);

module.exports = router;
