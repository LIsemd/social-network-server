const jsonwebtoken = require('jsonwebtoken')
const User = require('../models/users')
const Question = require('../models/questions')
const Answer = require('../models/answers')
const { secret } = require('../config')

class UserController {


    /**
     *
     * 判断是否为用户本人
     * @param {*} ctx
     * @param {*} next
     * @memberof UserController
     */
    async checkOwner(ctx, next) {
        if (ctx.params.id !== ctx.state.user._id) {
            ctx.throw(403, '没有权限')
        }
        await next()
    }

    /**
     *
     * 判断用户是否存在
     * @param {*} ctx
     * @param {*} next
     * @memberof UserController
     */
    async checkUserExist(ctx, next) {
        const user = await User.findById(ctx.params.id)
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        await next()
    }

    /**
     *
     * 查询用户
     * @param {*} ctx
     * @memberof UserController
     */
    async find(ctx) {
        const { per_page = 10 } = ctx.query
        const page = Math.max(ctx.query.page * 1, 1) - 1
        const perPage = Math.max(per_page * 1)
        ctx.body = await User.find({
            nickname: new RegExp(ctx.query.q)
        }).limit(perPage).skip(page * perPage)
    }

    /**
     *
     * 根据ID查询用户
     * @param {*} ctx
     * @memberof UserController
     */
    async findById(ctx) {
        const { fields = '' } = ctx.query
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('')
        const populateStr = fields.split(';').filter(f => f).map(f => {
            if (f === 'employments') {
                return 'employments.company employments.job'
            }
            if (f === 'eductaions') {
                return 'eductaions.major eductaions.school'
            }
            return f
        }).join(' ')
        const user = await User.findById(ctx.params.id).select(selectFields).populate(populateStr)
        if (!user) {
            ctx.throw(404, "用户不存在")
        }
        ctx.body = user
    }

    /**
     *
     * 创建用户
     * @param {*} ctx
     * @memberof UserController
     */
    async create(ctx) {
        ctx.verifyParams({
            username: { type: 'string' },
            password: { type: 'string' }
        })
        // 判断用户是否已经存在，如果存在，则返回409状态码
        const { username } = ctx.request.body
        const user = await User.findOne({ username })
        if (user) {
            ctx.throw(409, "用户已经存在")
        }
        // 如果不存在，则创建用户
        ctx.body = await new User(ctx.request.body).save()
    }

    /**
     *
     * 更新用户
     * @param {*} ctx
     * @memberof UserController
     */
    async update(ctx) {
        ctx.verifyParams({
            username: { type: 'string', required: false },
            nickname: { type: 'string', required: false },
            password: { type: 'string', required: false },
            avatar_url: { type: 'string', required: false },
            gender: { type: 'string', required: false },
            headline: { type: 'string', required: false },
            locations: { type: 'array', itemType: 'string', required: false },
            business: { type: 'string', required: false },
            employments: { type: 'array', itemType: 'object', required: false },
            educations: { type: 'array', itemType: 'object', required: false }
        })
        const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body, { new: true })
        if (!user) { ctx.throw(404, '用户不存在') }
        ctx.body = user
    }

    /**
     *
     * 删除用户
     * @param {*} ctx
     * @memberof UserController
     */
    async delete(ctx) {
        const user = await User.findByIdAndDelete(ctx.params.id)
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        ctx.status = 204
    }

    /**
     *
     * 登录
     * @param {*} ctx
     * @memberof UserController
     */
    async login(ctx) {
        ctx.verifyParams({
            username: { type: 'string' },
            password: { type: 'string' }
        })
        const user = await User.findOne(ctx.request.body)
        if (!user) {
            ctx.throw(401, "用户名或密码不正确")
        }
        const { _id, name } = user;
        const token = jsonwebtoken.sign({ _id, name }, secret, { expiresIn: '1d' })
        ctx.body = { token }
    }

    /**
     *
     * 获取用户关注列表
     * @param {*} ctx
     * @memberof UserController
     */
    async listFollowing(ctx) {
        const user = await User.findById(ctx.params.id).select('+following').populate('following')
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        ctx.body = user.following
    }

    /**
     *
     * 获取用户粉丝列表
     * @param {*} ctx
     * @memberof UserController
     */
    async listFollowers(ctx) {
        const user = await User.find({ following: ctx.params.id })
        ctx.body = user
    }

    /**
     *
     * 关注用户
     * @param {*} ctx
     * @memberof UserController
     */
    async follow(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following')
        if (!me.following.map(id => id.toString()).includes(ctx.params.id)) {
            me.following.push(ctx.params.id)
            me.save()
        }
        ctx.status = 204
    }

    /**
     *
     * 取消关注用户
     * @param {*} ctx
     * @memberof UserController
     */
    async unfollow(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following')
        const index = me.following.map(id => id.toString().indexOf(ctx.params.id))
        if (index > -1) {
            me.following.splice(index, 1)
            me.save()
        }
        ctx.status = 204
    }

    /**
     *
     * 获取关注的话题
     * @param {*} ctx
     * @memberof UserController
     */
    async listFollowingTopics(ctx) {
        const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics')
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        ctx.body = user.followingTopics
    }

    /**
     *
     * 关注话题
     * @param {*} ctx
     * @memberof UserController
     */
    async followTopic(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+followingTopics')
        if (!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)) {
            me.followingTopics.push(ctx.params.id)
            me.save()
        }
        ctx.status = 204
    }

    /**
     *
     * 取消关注话题
     * @param {*} ctx
     * @memberof UserController
     */
    async unfollowTopic(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+followingTopics')
        const index = me.followingTopics.map(id => id.toString().indexOf(ctx.params.id))
        if (index > -1) {
            me.followingTopics.splice(index, 1)
            me.save()
        }
        ctx.status = 204
    }

    /**
     *
     * 获取用户问题列表
     * @param {*} ctx
     * @memberof UserController
     */
    async listQuestions(ctx) {
        const questions = await Question.find({ questioner: ctx.params.id })
        ctx.body = questions
    }

    /**
     *
     * 获取点赞的答案
     * @param {*} ctx
     * @memberof UserController
     */
    async listLikingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+likingAnswers').populate('likingAnswers')
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        ctx.body = user.likingAnswers
    }

    /**
     *
     * 点赞
     * @param {*} ctx
     * @memberof UserController
     */
    async likeAnswer(ctx, next) {
        const me = await User.findById(ctx.state.user._id).select('+likingAnswers')
        if (!me.likingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.likingAnswers.push(ctx.params.id)
            me.save()
            await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: 1 } })
        }
        ctx.status = 204
        await next()
    }

    /**
     *
     * 取消点赞
     * @param {*} ctx
     * @memberof UserController
     */
    async unlikeAnswer(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+likingAnswers')
        const index = me.likingAnswers.map(id => id.toString().indexOf(ctx.params.id))
        if (index > -1) {
            me.likingAnswers.splice(index, 1)
            me.save()
            await Answer.findByIdAndUpdate(ctx.params.id, { $inc: { voteCount: -1 } })
        }
        ctx.status = 204
    }

    /**
     *
     * 获取点踩的答案
     * @param {*} ctx
     * @memberof UserController
     */
    async listDislikingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers')
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        ctx.body = user.dislikingAnswers
    }

    /**
     *
     * 点踩
     * @param {*} ctx
     * @memberof UserController
     */
    async dislikeAnswer(ctx, next) {
        const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
        if (!me.dislikingAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.dislikingAnswers.push(ctx.params.id)
            me.save()
        }
        ctx.status = 204
        await next()
    }

    /**
     *
     * 取消点踩
     * @param {*} ctx
     * @memberof UserController
     */
    async undislikeAnswer(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers')
        const index = me.dislikingAnswers.map(id => id.toString().indexOf(ctx.params.id))
        if (index > -1) {
            me.dislikingAnswers.splice(index, 1)
            me.save()
        }
        ctx.status = 204
    }

    /**
     *
     * 获取收藏的答案
     * @param {*} ctx
     * @memberof UserController
     */
    async listCollectAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+collectAnswers').populate('collectAnswers')
        if (!user) {
            ctx.throw(404, '用户不存在')
        }
        ctx.body = user.collectAnswers
    }

    /**
     *
     * 收藏
     * @param {*} ctx
     * @memberof UserController
     */
    async collectAnswer(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+collectAnswers')
        if (!me.collectAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.collectAnswers.push(ctx.params.id)
            me.save()
        }
        ctx.status = 204
    }

    /**
     *
     * 取消收藏
     * @param {*} ctx
     * @memberof UserController
     */
    async uncollectAnswer(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+collectAnswers')
        const index = me.collectAnswers.map(id => id.toString().indexOf(ctx.params.id))
        if (index > -1) {
            me.collectAnswers.splice(index, 1)
            me.save()
        }
        ctx.status = 204
    }
}

module.exports = new UserController()