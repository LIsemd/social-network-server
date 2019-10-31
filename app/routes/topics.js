const Router = require('koa-router')
const jwt = require('koa-jwt')
const router = new Router({ prefix: '/topics' })
const {
    checkTopicExist,
    find,
    findById,
    create,
    update,
    listTopicFollowers,
    listQuestions
} = require('../controllers/topics')
const { secret } = require('../config')
const auth = jwt({ secret })

router.get('/', find)
router.post('/', auth, create)
router.get('/:id', checkTopicExist, findById)
router.patch('/:id', auth, update)
router.get('/:id/followers', checkTopicExist, listTopicFollowers)
router.get('/:id/questions', checkTopicExist, listQuestions)

module.exports = router