const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    cover: {
        type: String
    },
    type: {
        type: String,
        required: true
    },
    looks: {
        type: Number
    },
    author: {
        type: String
    },
    content: {
        type: String,
        required: true
    },
    isnew: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = Article = mongoose.model('articles', ArticleSchema)