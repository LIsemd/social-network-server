const mongoose = require('mongoose')

const { Schema, model } = mongoose

const commentSchema = new Schema({
    __v: { type: Number, select: false },
    // 问题
    content: { type: String, required: true },
    // 回答者
    commentator: { type: Schema.Types.ObjectId, ref: 'User', select: false, required: true },
    // 问题ID
    questionId: { type: String, required: true },
    // 投票数
    answerId: { type: String, required: true },
    // 根评论ID
    rootCommentId: { type: String },
    // 回复用户
    replyTo: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

module.exports = model('Comment', commentSchema)