const Router = require('koa-router')
const jwt = require('koa-jwt')
const usersRouter = new Router({prefix: '/questions/:questionId/answers'}) // 前缀
const {
    find,findById, create, update,
    delete: del,
    checkAnswerExist,
    checkAnswerer
    } = require('../controllers/answers')
const { secret } = require('../config')
const auth = jwt({secret})
usersRouter.get('/', find)
usersRouter.post('/', auth, create)
usersRouter.get('/:id', checkAnswerExist, findById)
usersRouter.patch('/:id', auth, checkAnswerExist, checkAnswerer, update)
usersRouter.del('/:id', auth, checkAnswerExist, checkAnswerer, del)
module.exports = usersRouter