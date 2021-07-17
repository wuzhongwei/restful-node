const Router = require('koa-router')
const jwt = require('koa-jwt')
const usersRouter = new Router({prefix: '/questions'}) // 前缀
const {
    find,findById, create, update,
    delete: del,
    checkQuestionExist,
    checkQuestioner
    } = require('../controllers/questions')
const { secret } = require('../config')
const auth = jwt({secret})
usersRouter.get('/', find)
usersRouter.post('/', auth, create)
usersRouter.get('/:id', checkQuestionExist, findById)
usersRouter.patch('/:id', auth, checkQuestionExist, checkQuestioner, update)
usersRouter.del('/:id', auth, checkQuestionExist, checkQuestioner, del)
module.exports = usersRouter