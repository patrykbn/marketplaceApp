//posts.routes.js

const express = require('express');
const Post = require('../models/post.model');
const router = express.Router();

//Get all Posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username email');
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching posts...',  error: err});
    }
});

//get post by id number
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'username email');
        if (!post) return res.status(404).json({ message: 'Post not found...', error: err });
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching post...', error: err});
    }
});

//add a new post
router.post('/', async (req, res) => {
    const { title, description, price, author, phoneNumber, location, dateAdded } = req.body;
    try {
        const newPost = new Post({ title, description, price, author, phoneNumber, location, dateAdded });
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (err) {
        res.status(500).json({ message: 'Error creating new post...', error: err });
    }
});

//delete a post
router.delete('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Cannot find post with this id' });

        await post.remove();
        res.json({ message: 'Post deleted succesfully...'});
    } catch (err) {
        res.status(500).json({ message: 'Error deleting post...', error: err});
    }
});

//update a post
router.put('/:id', async (req, res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {new: true});
        if(!updatedPost) return res.status(404).json({ message: 'Post not found...'});
        res.json(updatedPost);
    } catch (err) {
        res.status(500).json({ message: 'Error editing post...', error: err });
    }
});

module.exports = router;