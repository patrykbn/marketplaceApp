const express = require('express');
const router = express.Router();
const multer = require('multer');
const postController = require('../controllers/post.controller');
const imageUpload = require('../utils/imageUpload')

router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);
router.post('/', imageUpload.single('image'), postController.addNewPost);
router.delete('/:id', postController.deletePost);
router.put('/:id', imageUpload.single('image'), postController.updatePost);

module.exports = router;