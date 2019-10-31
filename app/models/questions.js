const mongoose = require('mongoose')

const { Schema, model } = mongoose

const questionSchema = new Schema({
    __v: { type: Number, select: false },
    // 问题
    title: { type: String, required: true },
    // 描述
    introduction: { type: String },
    // 提问者
    questioner: { type: Schema.Types.ObjectId, ref: 'User', select: false, required: true },
    // 话题
    topics: {
        type: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
        select: false
    }
}, { timestamps: true })

module.exports = model('Question', questionSchema)