const mongoose = require('mongoose')

const { Schema, model } = mongoose

const topicSchema = new Schema({
    __v: { type: Number, select: false },
    // 话题名
    name: { type: String, required: true },
    // 图片
    avatar_url: { type: String },
    // 介绍
    introduction: { type: String, select: false }
}, { timestamps: true })

module.exports = model('Topic', topicSchema)