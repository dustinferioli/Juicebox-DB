const express = require('express');
const postsRouter = express.Router();
const { getAllPosts, createPost, updatePost, getPostById } = require('../db');
const { requireUser, requireActiveUser } = require('./utils')


postsRouter.use((req, rest, next) => {
    console.log("A request is being made to /posts");
    next();
})

// Retrieving posts (updated to filter out inactive posts if not the author)
postsRouter.get('/', async (req, res, next) => {
    try {
        const allPosts = await getAllPosts();

        const posts = allPosts.filter(post => {
            if (post.active && post.author.active){
                return true;
            } 
            
            if (req.user && post.author.id === req.user.id){
                return true;
            }
            return false;
        })

        res.send({
            posts
        });
    } catch ({ name, message }) {
        next({ name, message })
    }
})

// creating a post
postsRouter.post('/', requireActiveUser, async (req, res, next) => {

    const { title, content, tags = "" } = req.body;

    const tagArr = tags.trim().split(/\s+/);

    const postData = {
        authorId: req.user.id,
        title: title,
        content: content,
    };

    // only send the tags if there are some to send
    if (tagArr.length){
        postData.tags = tagArr;
    }

    try {
        const post = await createPost(postData);

        if (post){
            res.send({ post })
        } else {
            next({
                name: "CreatePostError",
                message: "Error in creating post"
            })
        }
    } catch ({ name, message }) {
        next({ name, message })
    }
})

// updating a post
postsRouter.patch('/:postId', requireActiveUser, async (req, res, next) => {
    const { postId } = req.params;
    const { title, content, tags } = req.body;

    const updateFields = {};

    if (tags && tags.length > 0){
        updateFields.tags = tags.trim().split(/\s+/);
    }

    if (title){
        updateFields.title = title;
    }

    if (content){
        updateFields.content = content;
    }

    try {
        const originalPost = await getPostById(postId);

        if (originalPost.author.id === req.user.id){
            const updatedPost = await updatePost(postId, updateFields);
            res.send({ post: updatedPost })
        } else {
            next({
                name: 'UnathorizedUserError',
                message: 'You cannot update a post that is not yours'
            })
        }
    } catch ({ name, message }) {
        next({ name, message })
    }
})

// deleting a post
postsRouter.delete('/:postId', requireActiveUser, async (req, res, next) => {
    try {
        const post = await getPostById(req.params.postId);
        
        if (post && post.author.id === req.user.id){
            const updatedPost = await updatePost(post.id, { active: false });

            res.send({ post: updatedPost })
        } else {
            next(post ? {
                name: "UnauthorizedUserError",
                message: "You cannot delete a post which is not yours"
            } : {
                name: "PostNotFoundError",
                message: "That post does not exist"
            });
        }
    } catch ({ name, message }) {
        next({ name, message })
    }
})



module.exports = postsRouter;