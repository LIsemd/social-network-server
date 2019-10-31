const Comment = require('../models/comments')

class CommentController {

    /**
     *
     * 判断话题是否存在
     * 三级嵌套
     * @param {*} ctx
     * @param {*} next
     * @memberof UserController
     */
    async checkCommentExist(ctx, next) {
        const comment = await Comment.findById(ctx.params.id).select('+commentator')
        if (!comment) {
            ctx.throw(404, '评论不存在')
        }
        if (ctx.params.questionId && comment.questionId !== ctx.params.questionId) {
            ctx.throw(404, '该问题下不存在此评论')
        }
        if (ctx.params.answerId && comment.answerId !== ctx.params.answerId) {
            ctx.throw(404, '该答案下不存在此评论')
        }
        ctx.state.comment = comment
        await next()
    }

    /**
     *
     * 判断是否为回答者
     * @param {*} ctx
     * @memberof CommentController
     */
    async checkCommentator(ctx, next) {
        const { comment } = ctx.state
        if (comment.commentator.toString() !== ctx.state.user._id) {
            ctx.throw(403, "没有权限")
        }
        await next()
    }

    /**
     *
     * 获取回答
     * @param {*} ctx
     * @memberof CommentController
     */
    async find(ctx) {
        const { per_page = 10 } = ctx.query
        const page = Math.max(ctx.query.page * 1, 1) - 1
        const perPage = Math.max(per_page * 1)
        const q = new RegExp(ctx.query.q)
        const { questionId, answerId } = ctx.params
        const { rootCommentId } = ctx.query
        ctx.body = await Comment.find({
            content: q,
            questionId,
            answerId,
            rootCommentId
        }).limit(perPage).skip(page * perPage).populate('commentator replyTo')
    }

    /**
     *
     * 根据ID获取回答
     * @param {*} ctx
     * @memberof CommentController
     */
    async findById(ctx) {
        const { fields = '' } = ctx.query
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
        const comment = await Comment.findById(ctx.params.id).select(selectFields).populate('commentator')
        ctx.body = comment
    }

    /**
     *
     * 创建回答
     * @param {*} ctx
     * @memberof CommentController
     */
    async create(ctx) {
        ctx.verifyParams({
            content: { type: 'string' },
            rootCommentId: { type: 'string', required: false },
            replyTo: { type: 'string', required: false },
        })
        const commentator = ctx.state.user._id
        const { questionId, answerId } = ctx.params
        const comment = await new Comment({ ...ctx.request.body, commentator, questionId, answerId }).save()
        ctx.body = comment
    }

    /**
     *
     * 更新回答
     * @param {*} ctx
     * @memberof CommentController
     */
    async update(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: false },
        })
        const { content } = ctx.request.body
        await ctx.state.comment.update(content)
        ctx.body = ctx.state.comment
    }

    /**
     *
     * 删除回答
     * @param {*} ctx
     * @memberof UserController
     */
    async delete(ctx) {
        const comment = await Comment.findByIdAndDelete(ctx.params.id)
        if (!comment) {
            ctx.throw(404, '回答不存在')
        }
        ctx.status = 204
    }

}

module.exports = new CommentController()