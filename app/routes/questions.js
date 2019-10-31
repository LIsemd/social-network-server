const Router = require('koa-router')
const jwt = require('koa-jwt')
const router = new Router({ prefix: '/questions' })
const {
    checkQuestioner,
    checkQuestionExist,
    find,
    findById,
    delete: del,
    create,
    update,
} = require('../controllers/questions')
const { secret } = require('../config')
const auth = jwt({ secret })

router.get('/', find)
router.post('/', auth, create)
router.get('/:id', checkQuestionExist, findById)
router.patch('/:id', auth, checkQuestionExist, checkQuestioner, update)
router.delete('/:id', auth, checkQuestionExist, checkQuestioner, del)

module.exports = router