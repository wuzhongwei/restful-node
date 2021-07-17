const Router = require('koa-router')
const jwt = require('koa-jwt')
const usersRouter = new Router({prefix: '/questions/:questionId/answers/:answerId/comments'}) // 前缀
const {
    find,findById, create, update,
    delete: del,
    checkCommentExist,
    checkCommentator
    } = require('../controllers/comments')
const { secret } = require('../config')
const auth = jwt({secret})
usersRouter.get('/', find)
usersRouter.post('/', auth, create)
usersRouter.get('/:id', checkCommentExist, findById)
usersRouter.patch('/:id', auth, checkCommentExist, checkCommentator, update)
usersRouter.del('/:id', auth, checkCommentExist, checkCommentator, del)
module.exports = usersRouter