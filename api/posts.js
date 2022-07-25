const express = require('express');
const postsRouter = express.Router();
const { getAllPosts } = require('../db');

postsRouter.use((req, rest, next) => {
    console.log("A request is being made to /posts");
    next();
})

postsRouter.get('/', async (req, res) => {
    const posts = await getAllPosts();
    res.send({
        posts
    })
})

module.exports = postsRouter;