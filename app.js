// const createError = require('http-errors');
// const express = require('express');
// const path = require('path');
// const cookieParser = require('cookie-parser');
// const logger = require('morgan');


// here we need the session because we have to 
// create session event for every log in
const session = require('express-session');
// then we can store the sessions in a session folder
// this module will automatically create a folder
// inside the application named sessions were it 
// stores all the sessions activities
const FileStore = require('session-file-store')(session)


const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const dishRouter = require('./routes/dishRouter');
const leaderRouter = require('./routes/leaderRouter');
const promoRouter = require('./routes/promoRouter');

const mongoose = require('mongoose');
const connect = mongoose.connect('mongodb://localhost:27017/manski', {
  useNewUrlParser: true
});


// we dont need this schema anymore 
// because we have the middle to get us
// connected to the models
const dishes = require('./models/schema')


connect.then((db)=>{
  console.log('connected correctly to the server \n');
}, (err)=>{
  console.log(err)
});


const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// we dont need to use the cookie parser here because
// we already have a set a body parser in the routes
        // set a secret code for the client
        // app.use(cookieParser('12345-67890'));


// then we can can use session name and template
// this will be used to tell node to create the 
// create
app.use(session({
  name: 'session-id', 
  secret: '12345-67890',
  saveUninitialized: false,
  resave: false,
  store: new FileStore()
}))



// as a order for this application, the users and the index route
// must be accessible to the main page without requiring 
// any authentication so that can browse the main page without
// any giving usernames or password
app.use('/', indexRouter);
app.use('/users', usersRouter);


// then we can set the function here
// there are alot of changes here compared to the other 
// set up because we are putting the authentication
// at the users route
function auth(req, res, next){
  console.log(`Response Headers: `, req.headers, ` \n\n `);

  // if(!req.signedCookies.user){
    if(!req.session.user){
      // var authHeader = req.headers.authorization;
      // if(!authHeader) {
    var err = new Error('Eey, no estas authenticado. \n Necesitas login \n');
        err.status = 403
          return next(err)
    }

    // var auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':')
    //   console.log('Authorization auth: \n ', auth, '\n\n')
   
    // var username = auth[0];
    // var password = auth[1];
    //   if(username === 'admin' && password === 'password'){
    //     // res.cookie('user', 'admin', {signed: "true"})
    //     req.session.user = 'admin'        
    //     next();
    //   } 
    //     else {
    //       var err = new Error('Eey, no estas authenticado. \n Necesitas login la primera');
    //       res.setHeader('WWW-Authenticate', 'Basic');
    //       err.status = 401;
    //       return next(err)
    //     } 
  // } 
    else {
      if(req.session.user === 'authenticated'){
        next();
      }  
        else {
          var err = new Error('Eey, no estas authenticado. \n Necesitas login la primera \n');
          err.status = 403;
          return next(err)
        }
    }
}




// call the auth function
app.use(auth)

// this is to send static pages if the user will not
// go to a specific route. the static pages are 
// placed in the public routes
app.use(express.static(path.join(__dirname, 'public')));


app.use('/dishes', dishRouter);
app.use('/leaders', leaderRouter);
app.use('/promotions', promoRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  console.log('sampasdf')
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
