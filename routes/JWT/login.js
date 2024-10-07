var express = require('express');
var router = express.Router();
const connectToMongo = require('../query/db');
const { sendSuccess, sendError } = require('../api/ResponseModule');
const jwt = require('jsonwebtoken');
const verifyToken = require('../JWT/auth')
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
dotenv.config();

router.post('/credentials', async (req, res) => {
    try {
        const db = await connectToMongo();
        const loginCollection = db.collection('logincredential');
        const { username, password } = req.body;

        if (!username || !password) {
            return sendError(res, 'Both username and password are required.');
        }

        const existingUser = await loginCollection.findOne({ username });
        if (existingUser) {
            return sendError(res, 'Username already exists. Please choose a different username.');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = { username, password: hashedPassword };
        const result = await loginCollection.insertOne(newUser);
        if (result.insertedId) {
            sendSuccess(res, { message: 'User created successfully', userId: result.insertedId });
        } else {
            sendError(res, 'Error inserting user data');
        }
    } catch (error) {
        console.error('Error creating user data:', error);
        sendError(res, 'Internal Server Error');
    }
});


router.get('/credentials/:username', async (req, res) => {
    const { username } = req.params;

    try {
        const db = await connectToMongo();
        const usersCollection = db.collection('logincredential');
        const user = await usersCollection.findOne({ username });
        if (!user) {
            return sendError(res, 'User not found', null, 404);
        }
        sendSuccess(res, {
            username: user.username,
        });
    } catch (error) {
        console.error('Error retrieving user credentials:', error);
        sendError(res, 'Internal Server Error', error);
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log("user",username)
    console.log("password",password)

    if (!username || !password) {
        return sendError(res, 'Username and password are required', null, 400);
    }

    try {
        const db = await connectToMongo();
        const usersCollection = db.collection('logincredential');
        const user = await usersCollection.findOne({ username });
        if (!user) {
            return sendError(res, 'Invalid credentials', null, 401);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return sendError(res, 'Invalid credentials', null, 401);
        }
        const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).send({ accessToken, refreshToken });
    } catch (error) {
        console.error('Error logging in:', error);
        sendError(res, 'Internal Server Error', error);
    }
});

module.exports = router;
