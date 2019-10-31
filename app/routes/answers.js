const Router = require('koa-router')
const jwt = require('koa-jwt')
const router = new Router({ prefix: '/questions/:questionId/answers' })
const {
    checkAnswerer,
    checkAnswerExist,
    find,
    findById,
    delete: del,
    create,
    update,
} = require('../controllers/answers')
const { secret } = require('../config')
const auth = jwt({ secret })

router.get('/', find)
router.post('/', auth, create)
router.get('/:id', checkAnswerExist, findById)
router.patch('/:id', auth, checkAnswerExist, checkAnswerer, update)
router.delete('/:id', auth, checkAnswerExist, checkAnswerer, del)

module.exports = router