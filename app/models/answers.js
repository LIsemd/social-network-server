const mongoose = require('mongoose')

const { Schema, model } = mongoose

const answerSchema = new Schema({
    __v: { type: Number, select: false },
    // 问题
    content: { type: String, required: true },
    // 回答者
    answerer: { type: Schema.Types.ObjectId, ref: 'User', select: false, required: true },
    // 问题ID
    questionId: { type: String, required: true },
    // 投票数
    voteCount: { type: Number, required: true, default: 0 }
}, { timestamps: true })

module.exports = model('Answer', answerSchema)