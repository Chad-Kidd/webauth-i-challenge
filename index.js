const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs'); /// <<<<<<<<<<<<<<<<<<<< yarn add bcryptjs

const session = require('express-session');

const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');
const protected = require('./auth/protected-middleware.js');

const server = express();

  // CREATING SESSION MIDDLEWARE
const sessionConfig = {
  name: 'Dracarys',

  secret: 'Sansa Stark cant keep a secret!',

  cookie: {
    httpOnly: true,

    maxAge: 1000 * 60 * 1,
    secure: false,
  },
  resave: false,

  saveUninitialized: true,
}

//restricted-middleware
// const restrictedMiddleware = (req, res, next) => {
// if(req.session && req.session.username) {
//   next()
// } else {
//   res.status(401).json({message: 'Please login to access'})
// }
// }


server.use(session(sessionConfig));
server.use(helmet());
server.use(express.json());
server.use(cors());

//GET working
server.get('/', (req, res) => {
  res.send("It's alive!");
});


//POST - register working
server.post('/api/register', (req, res) => {
  let user = req.body;
  // check for username and password

  const hash = bcrypt.hashSync(user.password, 8); // 2^8 rounds <<<<<<<<<<<<
  // pass > hashit > hash > hashit > hash > hashit > hash
  user.password = hash; // <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});


//POST - login working with valid credentials logic written and working 
//if invalid credentials provided
//login working but not with restrictedMiddleware ???? gives 401 error
server.post('/api/login',  (req, res) => {
  let { username, password } = req.body;

  // we compare the password guess against the database hash
  Users.findBy({ username })
    .first()
    .then(user => {
      if (user && bcrypt.compareSync(password, user.password)) {
        req.session.username = user.username;
        //session username store
        res.status(200).json(res.send( 
          //welcome login message
          `Welcome ${user.username}! have a cookie`));
      } else {
        res.status(401);
        //invalid credentials message when logging in with wrong credentials 
        res.send('INVALID CREDENTIALS: You Shall NOT Pass!!')
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});


// protect this route, users must provide valid username/password to see the list of users
//get working showing array of all users
server.get('/api/users', protected, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

server.get('/api/logout', (req, res) => {
  //if logged in
  if(req.session) {
  req.session.destroy();
  } 
  else {
  res.end('already logged out')
  }
})

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
