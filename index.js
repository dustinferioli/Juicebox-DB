require('dotenv').config();
const { PORT = 3000 } = process.env;
const morgan = require('morgan');
const express = require('express');
const server = express();
const apiRouter = require('./api');
const { client } = require('./db');

client.connect();

server.use(morgan('dev'));
// logs information about every request

server.use(express.json());

server.use((req, res, next) => {
    console.log("<___BODY LOGGER START___>");
    console.log(req.body);
    console.log("<____BODY LOGGER END____>");

    next();
})

server.use('/api', apiRouter);

server.listen(PORT, () => {
    console.log(`The server is up on port ${PORT}`)
})

