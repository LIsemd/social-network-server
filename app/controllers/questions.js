const Question = require('../models/questions')

class QuestionController {

    /**
     *
     * 判断话题是否存在
     * @param {*} ctx
     * @param {*} next
     * @memberof UserController
     */
    async checkQuestionExist(ctx, next) {
        const question = await Question.findById(ctx.params.id).select('+questioner')
        if (!question) {
            ctx.throw (404, '问题不存在')
        }
        ctx.state.question = question
        await next()
    }

    /**
     *
     * 判断是否为问题提问者
     * @param {*} ctx
     * @memberof QuestionController
     */
    async checkQuestioner(ctx, next) {
        const { question } = ctx.state
        if (question.questioner.toString() !== ctx.state.user._id) {
            ctx.throw(403, "没有权限")
        }
        await next()
    }

    /**
     *
     * 获取问题
     * @param {*} ctx
     * @memberof QuestionController
     */
    async find(ctx) {
        const { per_page = 10 } = ctx.query
        const page = Math.max(ctx.query.page * 1, 1) - 1
        const perPage = Math.max(per_page * 1)
        const q = new RegExp(ctx.query.q)
        ctx.body = await Question.find({
            $or: [{ title: q }, { description: q }]
        }).limit(perPage).skip(page * perPage)
    }

    /**
     *
     * 根据ID获取问题
     * @param {*} ctx
     * @memberof QuestionController
     */
    async findById(ctx) {
        const { fields = '' } = ctx.query
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
        const question = await Question.findById(ctx.params.id).select(selectFields).populate('questioner topics')
        ctx.body = question
    }

    /**
     *
     * 创建问题
     * @param {*} ctx
     * @memberof QuestionController
     */
    async create(ctx) {
        ctx.verifyParams({
            title: { type: 'string' },
            description: { type: 'string', required: false },
            topics: { type: 'array', itemType: 'string', required: false }
        })
        const question = await new Question({ ...ctx.request.body, questioner: ctx.state.user._id }).save()
        ctx.body = question
    }

    /**
     *
     * 更新问题
     * @param {*} ctx
     * @memberof QuestionController
     */
    async update(ctx) {
        ctx.verifyParams({
            title: { type: 'string', required: false },
            description: { type: 'string', required: false },
            topics: { type: 'array', itemType: 'string', required: false }
        })
        await ctx.state.question.update(ctx.request.body)
        ctx.body = ctx.state.question
    }

    /**
     *
     * 删除问题
     * @param {*} ctx
     * @memberof UserController
     */
    async delete(ctx) {
        const question = await Question.findByIdAndDelete(ctx.params.id)
        if (!question) {
            ctx.throw(404, '问题不存在')
        }
        ctx.status = 204
    }

}

module.exports = new QuestionController()