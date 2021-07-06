const Router = require('koa-router')
const jsonwebtoken = require('jsonwebtoken')
const usersRouter = new Router({prefix: '/topics'}) // 前缀
const {
    find, create, findById, update, listTopicsFollower,
    checkTopicsExist
    } = require('../controllers/topics')
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
usersRouter.get('/:id', checkTopicsExist, findById)
usersRouter.patch('/:id', auth, checkTopicsExist, update)
usersRouter.get('/:id/followers', checkTopicsExist, listTopicsFollower)
module.exports = usersRouter