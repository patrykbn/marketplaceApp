//post.model.js

const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    phoneNumber: { type: Number, required: true },
    location: { type: String, required: true },
    dateAdded: { type: Date, default: Date.now },
    dateEdited: { type: Date },
    image: { type: String },
});

module.exports = mongoose.model('Post', PostSchema);