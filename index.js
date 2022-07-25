const PORT = 3000;
const morgan = require('morgan');
const express = require('express');
const server = express();
const apiRouter = require('./api');
const { client } = require('./db');
client.connect();

server.use('/api', apiRouter);

server.listen(PORT, () => {
    console.log(`The server is up on port ${PORT}`)
})

server.use(morgan('dev'));

server.use(express.json());

server.use((req, res, next) => {
    console.log("<___BODY LOGGER START___>");
    console.log(req.body);
    console.log("<____BODY LOGGER END____>");

    next();
})
