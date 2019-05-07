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

server.use(session(sessionConfig));
server.use(helmet());
server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
  res.send("It's alive!");
});

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

server.post('/api/login', (req, res) => {
  let { username, password } = req.body;

  // we compare the password guess against the database hash
  Users.findBy({ username })
    .first()
    .then(user => {
      //
      if (user && bcrypt.compareSync(password, user.password)) {
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

// protect this route, users must provide valid username/password to see the list of users
server.get('/api/users', protected, (req, res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
