const Router = require('koa-router')
const jwt = require('koa-jwt')
const router = new Router({ prefix: '/users' })
const {
    checkOwner,
    checkUserExist,
    find,
    findById,
    create,
    update,
    delete: del,
    login,
    listFollowing,
    listFollowers,
    follow,
    unfollow,
    listFollowingTopics,
    followTopic,
    unfollowTopic,
    listQuestions,
    likeAnswer,
    unlikeAnswer,
    dislikeAnswer,
    undislikeAnswer,
    listLikingAnswers,
    listDislikingAnswers,
    listCollectAnswers,
    collectAnswer,
    uncollectAnswer
} = require('../controllers/users')
const { checkTopicExist } = require('../controllers/topics')
const { checkAnswerExist } = require('../controllers/answers')
const { secret } = require('../config')
const auth = jwt({ secret })

// 用户增删改查
router.get('/', find)
router.post('/', create)
router.get('/:id', findById)
router.patch('/:id', auth, checkOwner, update)
router.delete('/:id', auth, checkOwner, del)

// 登录
router.post('/login', login)

// 关注用户
router.get('/:id/following', listFollowing)
router.get('/:id/followers', listFollowers)
router.put('/following/:id', auth, checkUserExist, follow)
router.delete('/following/:id', auth, checkUserExist, unfollow)

// 关注话题
router.get('/:id/followingTopics', listFollowingTopics)
router.put('/followingTopics/:id', auth, checkTopicExist, followTopic)
router.delete('/followingTopics/:id', auth, checkTopicExist, unfollowTopic)

// 问题列表
router.get('/:id/questions', listQuestions)

// 赞与踩答案的互斥关系
router.get('/:id/likingAnswers', listLikingAnswers)
router.get('/:id/dislikingAnswers', listDislikingAnswers)
router.put('/likingAnswer/:id', auth, checkAnswerExist, likeAnswer, undislikeAnswer)
router.delete('/likingAnswer/:id', auth, checkAnswerExist, unlikeAnswer)
router.put('/dislikingAnswer/:id', auth, checkAnswerExist, dislikeAnswer, unlikeAnswer)
router.delete('/dislikingAnswer/:id', auth, checkAnswerExist, undislikeAnswer)

// 收藏答案
router.get('/:id/collectAnswers', listCollectAnswers)
router.put('/collectAnswer/:id', auth, checkAnswerExist, collectAnswer)
router.delete('/collectAnswer/:id', auth, checkAnswerExist, uncollectAnswer)

module.exports = router