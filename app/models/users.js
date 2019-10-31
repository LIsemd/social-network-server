const mongoose = require('mongoose')

const { Schema, model } = mongoose

const userSchema = new Schema({
    __v: { type: Number, select: false },
    // 用户名
    username: { type: String, required: true },
    // 昵称
    nickname: { type: String },
    // 密码
    password: { type: String, required: true, select: false },
    // 头像
    avatar_url: { type: String },
    // 性别
    gender: { type: String, enum: ['male', 'female'], default: 'male', required: true },
    // 签名
    headline: { type: String },
    // 地址
    locations: { type: [{ type: Schema.Types.ObjectId, ref: "Topic" }], select: false },
    // 行业
    business: { type: Schema.Types.ObjectId, ref: "Topic", select: false },
    // 工作
    employments: {
        type: [{
            company: { type: Schema.Types.ObjectId, ref: "Topic" },
            job: { type: Schema.Types.ObjectId, ref: "Topic" }
        }],
        select: false
    },
    // 教育
    educations: {
        type: [{
            school: { type: Schema.Types.ObjectId, ref: "Topic" },
            major: { type: Schema.Types.ObjectId, ref: "Topic" },
            diploma: { type: Number, enum: [1, 2, 3, 4, 5] },
            entrance_year: { type: Number },
            graduation_year: { type: Number }
        }],
        select: false
    },
    // 关注用户
    following: {
        type: [{ type: Schema.Types.ObjectId, ref: "User" }],
        select: false
    },
    // 关注话题
    followingTopics: {
        type: [{ type: Schema.Types.ObjectId, ref: "Topic" }],
        select: false
    },
    // 点赞答案
    likingAnswers: {
        type: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
        select: false
    },
    // 点踩答案
    dislikingAnswers: {
        type: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
        select: false
    },
    // 收藏答案
    collectAnswers: {
        type: [{ type: Schema.Types.ObjectId, ref: "Answer" }],
        select: false
    },
}, { timestamps: true })

module.exports = model('User', userSchema)