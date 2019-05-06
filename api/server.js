const express = require('express');
const helmet = require('helmet');

const userRouter = require('../routers/user-router');

const server = express();

server.use(helmet());
server.use(express.json());

server.use('/', userRouter);

// sanity check route
server.get('/', (req, res) => {
  res.status(200).json({ hello: 'World!' });
});

module.exports = server;