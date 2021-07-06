const Router = require('koa-router')
const jsonwebtoken = require('jsonwebtoken')
const usersRouter = new Router({prefix: '/questions'}) // 前缀
const {
    find,findById, create, update,
    delete: del,
    checkQuestionExist,
    checkQuestioner
    } = require('../controllers/questions')
const { secret } = require('../config')
const auth = async (ctx, next) => {
    const { authorization = '' } = ctx.request.header
    const token = authorization.replace('Bearer ', '')
    // try catch 处理500错误 鉴权
    try {
        const user = jsonwebtoken.verify(token, secret)
        ctx.state.user = user
    } catch (err) {
        ctx.throw(401, err.message)
    }
    await next()
}
usersRouter.get('/', find)
usersRouter.post('/', auth, create)
usersRouter.get('/:id', checkQuestionExist, findById)
usersRouter.patch('/:id', auth, checkQuestionExist, checkQuestioner, update)
usersRouter.del('/:id', auth, checkQuestioner, del)
module.exports = usersRouter