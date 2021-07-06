const Router = require('koa-router')
const jwt = require('koa-jwt')
const usersRouter = new Router({prefix: '/users'}) // 前缀
const {
    find, create, findById, delete:del, update, login, checkOwner,
    listFollowing, follow, unfollow, listFollower,
    checkUserExist, followTopics, unfollowTopics, listFollowingTopics,
    listQuestions
    } = require('../controllers/users')
const { checkTopicsExist } = require('../controllers/topics')
const { secret } = require('../config')
const auth = jwt({secret})
usersRouter.get('/', find)
usersRouter.get('/:id', findById)
usersRouter.post('/', create)
usersRouter.del('/:id', auth, checkOwner, del)
usersRouter.patch('/:id', auth, checkOwner, update)
usersRouter.post('/login', login)
usersRouter.get('/:id/following', listFollowing)
usersRouter.get('/:id/followers', listFollower)
usersRouter.put('/following/:id', auth, checkUserExist, follow)
usersRouter.del('/following/:id', auth, checkUserExist, unfollow)
usersRouter.get('/:id/followingTopics', listFollowingTopics)
usersRouter.put('/followingTopics/:id', auth, checkTopicsExist, followTopics)
usersRouter.del('/followingTopics/:id', auth, checkTopicsExist, unfollowTopics)
usersRouter.get('/:id/questions', listQuestions)
module.exports = usersRouter