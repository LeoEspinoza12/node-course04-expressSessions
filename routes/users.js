var express = require('express');

const bodyParser = require('body-parser')
const User = require('../models/user')

var router = express.Router();

router.use(bodyParser.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

router.post('/signup', (req, res, next) => {
  // check if we have the username in our database
  User.findOne({username: req.body.username})
    // then handle the promise
    .then((user)=>{
      // if the promise return null, then we have to 
      // create a new error that will check the error
      if(user != null){
        var err = new Error('\nUser' + req.body.username + 'already exists \n')
        err.status = 403;
        next(err)
      }
        else{
          // if we find
          return User.create(req.body)
          // WE TOOK THIS FROM THE PREVIOUS SET UP
                              // username: req.body.username
                              // password: req.body.password
        }
    })
      .then((user)=>{
        // then we pass the success
        res.statusCode = 200
        // set the header for our response
        res.setHeader('Content-Type', 'application/json');
        // then pass the object
        res.json({status: 'Registration successfull', user: user})
        // handle the errors
      }, (err)=> next(err))
      // handle the errors
      .catch((err)=> next(err))
});


//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////
router.post('/login', (req, res, next) => {

  // if the user session does not exists then we will send an error
  // of authentication  
  if (!req.session.user) {
    // then we will pass the headers authorization.
    // the authorization headers, looks like this;
          // Authorization auth:
            // [ 'username', 'password' ]
    var authHeader = req.headers.authorization;
    // if empty then we will handle if it is empty
    if (!authHeader) {
      var err = new Error('Eey, no estas authenticado. \n Necesitas login la primera \n');
        res.setHeader('WWW-Authenticate', 'Basic');
          err.status = 401;
            return next(err)
    }

    // then we will split the auth header 
    var auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(':')
      console.log('Authorization auth: \n ', auth, '\n\n')

    // assign the variable
    var username = auth[0];
    var password = auth[1];
   
    // then we can find the variable
    User.findOne({username: username})
      
      // handle the promise
      .then((user) => {
        // if null
        // console.log('ueser')
         if (user === null) {
           var err = new Error('User ' + username + ' does not exist!');
           err.status = 403;
           return next(err);
         } 
         // if the password does not match
         else if (user.password !== password) {
           var err = new Error('Your password is incorrect!');
           err.status = 403;
           return next(err);
         } 
         // the both match
         else if (user.username === username && user.password === password) {
           req.session.user = 'authenticated';
           res.statusCode = 200;
           res.setHeader('Content-Type', 'text/plain');
           res.end('You are authenticated!')
         }
      })
        .catch((err)=> next(err))
  }
    else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      res.end('You are already authenticated\n')
    }
})


//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

router.get('/logout', (req, res) => {
  // check if we have a session stored in our browser
  if (req.session) {
    // if there is, then we can destroy
    // the session 
    req.session.destroy();
    // clear the cookie using the 'session-id' as the reference 
    res.clearCookie('session-id');
    // then  we can redirect the user to the 
    // index page (since we have placed it on top of the 
    // routes making it available 
    res.redirect('/');
  } else {
    // if not, set an error and pass the error
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});


module.exports = router;








