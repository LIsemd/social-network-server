const Topic = require('../models/topics')
const User = require('../models/users')
const Question = require('../models/questions')
class TopicController {

    /**
     *
     * 判断话题是否存在
     * @param {*} ctx
     * @param {*} next
     * @memberof UserController
     */
    async checkTopicExist(ctx, next) {
        const topic = await Topic.findById(ctx.params.id)
        if (!topic) {
            ctx.throw (404, '话题不存在')
        }
        await next()
    }

    /**
     *
     * 获取话题
     * @param {*} ctx
     * @memberof TopicController
     */
    async find(ctx) {
        const { per_page = 10 } = ctx.query
        const page = Math.max(ctx.query.page * 1, 1) - 1
        const perPage = Math.max(per_page * 1)
        ctx.body = await Topic.find({
            name: new RegExp(ctx.query.q)
        }).limit(perPage).skip(page * perPage)
    }

    /**
     *
     * 根据ID获取话题
     * @param {*} ctx
     * @memberof TopicController
     */
    async findById(ctx) {
        const { fields = '' } = ctx.query
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
        const topic = await Topic.findById(ctx.params.id).select(selectFields)
        ctx.body = topic
    }

    /**
     *
     * 创建话题
     * @param {*} ctx
     * @memberof TopicController
     */
    async create(ctx) {
        ctx.verifyParams({
            name: { type: 'string' },
            avatar_url: { type: 'string', required: false },
            introduction: { type: 'string', required: false }
        })
        const topic = await new Topic(ctx.request.body).save()
        ctx.body = topic
    }

    /**
     *
     * 更新话题
     * @param {*} ctx
     * @memberof TopicController
     */
    async update(ctx) {
        ctx.verifyParams({
            name: { type: 'string', required: false },
            avatar_url: { type: 'string', required: false },
            introduction: { type: 'string', required: false }
        })
        const topic = await Topic.findByIdAndUpdate(ctx.params.id, ctx.request.body)
        ctx.body = topic
    }

    /**
     *
     * 获取话题粉丝列表
     * @param {*} ctx
     * @memberof UserController
     */
    async listTopicFollowers(ctx) {
        const user = await User.find({ followingTopics: ctx.params.id })
        ctx.body = user
    }

    
    /**
     * （多对多关系）
     * 列出话题下的问题列表
     * @param {*} ctx
     * @memberof TopicController
     */
    async listQuestions(ctx) {
        const questions = await Question.find({topics: ctx.params.id})
        ctx.body = questions
    }
}

module.exports = new TopicController()