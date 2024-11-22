const Post = require('../models/post.model');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
const getImageFileType = require('../utils/getImageFileType');

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username email');
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching posts...', error: err.message });
    }
};

exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'username email');
        if (!post) return res.status(404).json({ message: 'Post not found...' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching post...', error: err.message });
    }
};

exports.addNewPost = async (req, res) => {
    const { title, description, price, author, phoneNumber, location, dateAdded } = req.body;
    try {
        const filetype = req.file ? await getImageFileType(req.file) : 'unknown';
        if (req.file && !['image/png', 'image/jpeg', 'image/gif'].includes(filetype)) {
            await unlinkAsync(req.file.path);
            return res.status(400).json({ message: 'Invalid image format' });
        }
        const newPost = new Post({
            title,
            description,
            price,
            author,
            phoneNumber,
            location,
            dateAdded,
            image: req.file ? req.file.filename : null,
        });
        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (err) {
        if (req.file) await unlinkAsync(req.file.path);
        res.status(500).json({ message: 'Error creating new post...', error: err.message });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Cannot find post with this id' });
        if (post.image) {
            await unlinkAsync(`uploads/${post.image}`);
        }
        await post.remove();
        res.json({ message: 'Post deleted successfully...' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting post...', error: err.message });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found...' });

        const filetype = req.file ? await getImageFileType(req.file) : 'unknown';
        if (req.file && !['image/png', 'image/jpeg', 'image/gif'].includes(filetype)) {
            await unlinkAsync(req.file.path);
            return res.status(400).json({ message: 'Invalid image format' });
        }

        if (req.file) {
            if (post.image) {
                await unlinkAsync(`uploads/${post.image}`);
            }
            post.image = req.file.filename;
        }

        Object.assign(post, req.body);
        post.dateEdited = new Date().toISOString();

        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (err) {
        if (req.file) await unlinkAsync(req.file.path);
        res.status(500).json({ message: 'Error editing post...', error: err.message });
    }
};
