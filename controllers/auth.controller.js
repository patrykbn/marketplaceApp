//auth.constroller.js

const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const getImageFileType = require('../utils/getImageFileType');
const fs = require('fs')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)

exports.register = async (req, res) => {
    try {
        const { username, password, email } = req.body;
        const filetype = req.file ? await getImageFileType(req.file) : 'unknown';
        console.log(req.body, req.file);

        if (!username || typeof username !== 'string' || !password || typeof password !== 'string' || !email || typeof email !== 'string' || !req.file || !['image/png', 'image/jpeg', 'image/gif'].includes(filetype)) {
            await unlinkAsync(req.file.path);
            return res.status(400).json({ message: 'Invalid input data' });
        }
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(409).json({ message: 'User with this username already exists' });
            }
            if (existingUser.email === email) {
                return res.status(409).json({ message: 'User with this email already exists' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, email, password: hashedPassword , avatar: req.file.filename});

        res.status(201).json({ message: 'User successfully created' });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ message: 'Error registering user', error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
            return res.status(400).json({ message: 'Invalid login credentials' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'Email or password are incorrect'});
        } else {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                req.session.user = {
                    email: user.email,
                    id: user._id
                };
                res.status(200).json({ message: 'Login successful!'})
            } else {
                res.status(400).json({ message: 'Email or password are incorrect'});
            }
        }
    } catch (err) {
        res.status(500).json({ message: 'Error logging in...', error: err});
    }
}

exports.logout = async (req, res) => {
    try {
        req.session.destroy(async err => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ message: 'Error logging out...', error: err.message });
            }
            if (process.env.NODE_ENV !== 'production') {
                const Session = require('../models/session.model');
                await Session.deleteMany({});
            }
            res.clearCookie('connect.sid', { path: '/' });
            res.status(200).json({ message: 'Logout successful' });
        });
    } catch (err) {
        console.error('Unexpected error during logout:', err);
        res.status(500).json({ message: 'Unexpected error during logout', error: err.message });
    }
};

exports.getUser = async (req, res) => {
    res.status(200).json({message:'You are logged in'});
};
