const Answer = require('../models/answers')

class AnswerController {

    /**
     *
     * 判断话题是否存在
     * @param {*} ctx
     * @param {*} next
     * @memberof UserController
     */
    async checkAnswerExist(ctx, next) {
        const answer = await Answer.findById(ctx.params.id).select('+answerer')
        if (!answer) {
            ctx.throw (404, '回答不存在')
        }
        // 只有在删改查答案的时候才检查此逻辑，赞/踩答案时不检查
        if (ctx.params.questionId && answer.questionId !== ctx.params.questionId) {
            ctx.throw (404, '该问题下不存在此回答')
        }
        ctx.state.answer = answer
        await next()
    }

    /**
     *
     * 判断是否为回答者
     * @param {*} ctx
     * @memberof AnswerController
     */
    async checkAnswerer(ctx, next) {
        const { answer } = ctx.state
        if (answer.answerer.toString() !== ctx.state.user._id) {
            ctx.throw(403, "没有权限")
        }
        await next()
    }

    /**
     *
     * 获取回答
     * @param {*} ctx
     * @memberof AnswerController
     */
    async find(ctx) {
        const { per_page = 10 } = ctx.query
        const page = Math.max(ctx.query.page * 1, 1) - 1
        const perPage = Math.max(per_page * 1)
        const q = new RegExp(ctx.query.q)
        ctx.body = await Answer.find({
            content: q,
            questionId: ctx.params.questionId
        }).limit(perPage).skip(page * perPage)
    }

    /**
     *
     * 根据ID获取回答
     * @param {*} ctx
     * @memberof AnswerController
     */
    async findById(ctx) {
        const { fields = '' } = ctx.query
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
        const answer = await Answer.findById(ctx.params.id).select(selectFields).populate('answerer')
        ctx.body = answer
    }

    /**
     *
     * 创建回答
     * @param {*} ctx
     * @memberof AnswerController
     */
    async create(ctx) {
        ctx.verifyParams({
            content: { type: 'string' },
        })
        const answerer = ctx.state.user._id
        const { questionId } = ctx.params
        const answer = await new Answer({ ...ctx.request.body, answerer, questionId }).save()
        ctx.body = answer
    }

    /**
     *
     * 更新回答
     * @param {*} ctx
     * @memberof AnswerController
     */
    async update(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: false },
        })
        await ctx.state.answer.update(ctx.request.body)
        ctx.body = ctx.state.answer
    }

    /**
     *
     * 删除回答
     * @param {*} ctx
     * @memberof UserController
     */
    async delete(ctx) {
        const answer = await Answer.findByIdAndDelete(ctx.params.id)
        if (!answer) {
            ctx.throw(404, '回答不存在')
        }
        ctx.status = 204
    }

}

module.exports = new AnswerController()