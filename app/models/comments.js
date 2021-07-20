const mongoose = require('mongoose')
const {Schema, model} = mongoose

const commentSchema = new Schema({
    __v: {type: Number, select: false},
    content: {type: String, required: true},
    commentator: {
        type: Schema.Types.ObjectId,
        ref: 'User', required: true, select: false
    },
    questionId: {
        type: String,
        required: true
    },
    answerId: {
        type: String,
        required: true
    },
    rootCommentId: { // 二级评论参数
        type: String
    },
    replyTo: {
        type: Schema.Types.ObjectId, //回复给哪个用户
        ref: 'User'
    }
}, {timestamps: true})


module.exports = model('Comment', commentSchema)