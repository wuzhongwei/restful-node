const Router = require('koa-router')
const jwt = require('koa-jwt')
const usersRouter = new Router({prefix: '/topics'}) // 前缀
const {
    find, create, findById, update, listTopicsFollower,
    checkTopicsExist, listQuestions
    } = require('../controllers/topics')
const { secret } = require('../config')
const auth = jwt({secret})
usersRouter.get('/', find)
usersRouter.post('/', auth, create)
usersRouter.get('/:id', checkTopicsExist, findById)
usersRouter.patch('/:id', auth, checkTopicsExist, update)
usersRouter.get('/:id/followers', checkTopicsExist, listTopicsFollower)
usersRouter.get('/:id/questions', checkTopicsExist, listQuestions)
module.exports = usersRouter