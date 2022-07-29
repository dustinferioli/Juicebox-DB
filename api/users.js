const express = require('express');
const usersRouter = express.Router();
const { getAllUsers, getUserByUsername, createUser, getUserById, updateUser } = require('../db');
const { requireUser, requireActiveUser } = require('./utils')
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

usersRouter.use((req, res, next) => {
    console.log("A request is being made to /users");

    next();
})

usersRouter.get('/', async (req, res) => {
    const users = await getAllUsers();

    res.send({
        users
    });

})

usersRouter.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    // requests must have both
    if (!username || !password){
        next({
            name: "MissingCredentialsError",
            message: "Please supply both a username and password"
        });
    }

    try {
        const user = await getUserByUsername(username);

        if (user && user.password == password){
            const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET)
            res.send({ message: "You are logged in", token: token })
        } else {
            next({
                name: "IncorrectCredentialsError",
                message: 'Username or password is incorrect'
            })
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
})



usersRouter.post('/register', async (req, res, next) => {
    const { username, password, name, location } = req.body;

    try {
        const _user = await getUserByUsername(username);

        if (_user) {
            next({
                name: 'UserExistsError',
                message: 'A user by that username already exists'
            });
        }

        const user = await createUser({
            username,
            password,
            name,
            location
        });

        const token = jwt.sign({
            id: user.id,
            username
        }, JWT_SECRET, {
            expiresIn: '1w'
        });

        res.send({
            message: "Thank you for signing up",
            token
        })
    } catch ({ name, message }) {
        next({ name, message })
    }
});

// gets a user by userId
usersRouter.get('/:userId', requireUser, async (req, res, next) => {
    try {
        const user = await getUserById(req.params.userId);
        
        if (user && user.id == req.params.userId){
            res.send(user)
        } else {
            next(user ? {
                name:"UnauthorizedUserError",
                message: "You cannot access an account that is not yours"
            } : {
                name: "UserNotFoundError",
                message: "This user does not exist"
            })
        }
    } catch ({ name, message }) {
        next({ name, message })
    }
})


// deactivates a user
usersRouter.delete('/:userId', requireActiveUser, async (req, res, next) => {
    try {
        const user = await getUserById(req.params.userId);

        if (user && user.id == req.params.userId){
            const deactivatedUser = await updateUser(user.id, { active : false });
            res.send({
                user: deactivatedUser
            })
        } else {
            next(user ? {
                name: "UnauthorizedUserError",
                message: "You cannot deactivate an account that is not yours"
            } : {
                name: "UserNotFoundError",
                message: "This user does not exist"
            })
        }
    } catch ({ name, message }) {
        next({ name, message })
    }
})

// re-activates user
usersRouter.patch('/:userId', requireUser, async (req, res, next) => {
    try {
        const user = await getUserById(req.params.userId);
        if (user && user.id == req.params.userId){
            const reactivatedUser = await updateUser(user.id, { active : true });
            res.send({
                user: reactivatedUser
            })
        } else {
            next(user ? {
                name: "UnauthorizedUserError",
                message: "You cannot reactivate an account that is not yours"
            } : {
                name: "UserNotFoundError",
                message: "This user does not exist"
            })
        }
    } catch ({ name, message }) {
        next({ name, message })
    }
})

module.exports = usersRouter;