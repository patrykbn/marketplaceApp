//server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
require('dotenv').config();
const multer = require('multer');

const app = express()
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        secure: process.env.NODE_ENV == 'production',
    },
    store: MongoStore.create({ 
        mongoUrl: 'mongodb://localhost:27017/marketplaceApp', 
        collectionName: 'sessions' // Optional: specify the collection name
    }),
}));


app.use(express.static(path.join(__dirname, '/client/build')));
app.use(express.static(path.join(__dirname, '/public')));

const postsRoutes = require('./routes/posts.routes');
const authRoutes = require('./routes/auth.routes');

mongoose.connect('mongodb://localhost:27017/marketplaceApp', { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Database connection error', err));

app.use('/api/posts', postsRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('test homePage')
})

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
    } else if (err) {
        return res.status(500).json({ message: 'An unknown error occurred', error: err.message });
    }
    next();
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log('Server running on localhost:${PORT}'));