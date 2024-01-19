const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('connect-flash');
const { create } = require('express-handlebars');
const session = require('express-session');
const methodOverride = require('method-override')
const passport = require('passport');
const isAuthenticated =require ('./middlewares/isAuthenticated');


const swaggerDocs = require('./config/swagger').swaggerDocs;
const swaggerUi = require('./config/swagger').swaggerUi;

const hbs = create({
  extname: 'hbs',
  defaultLayout: 'main',
  partialsDir: 'views/partials',
  helpers: require('./utils/helpers')
});

require('dotenv').config();



const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET || 'SECRET',
  resave: false,
  saveUninitialized: false,
}));

// view engine setup
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', './views');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('public'));
app.use(flash());
app.use(methodOverride('_method'));
app.use(passport.initialize());
app.use(passport.session());

require('./config/passport');
require('./config/cloudinary');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));






const indexRouter = require('./routes/index');


app.use('/', indexRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  console.log(JSON.stringify(err))

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
