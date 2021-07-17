const Router = require('koa-router')
const jwt = require('koa-jwt')
const usersRouter = new Router({prefix: '/users'}) // 前缀
const {
    find, create, findById, delete:del, update, login, checkOwner,
    listFollowing, follow, unfollow, listFollower,
    checkUserExist, followTopics, unfollowTopics, listFollowingTopics,
    listQuestions, 
    listLikingAnswers, likeAnswer, unlikeAnswer,
    listDislikingAnswers, dislikeAnswer, undislikeAnswer,
    listCollectingAnswers, collectAnswer, uncollectAnswer
    } = require('../controllers/users')
const { checkTopicsExist } = require('../controllers/topics')
const { checkAnswerExist } = require('../controllers/answers')
const { secret } = require('../config')
const auth = jwt({secret})
// async (ctx, next) => {
//     const { authorization = '' } = ctx.request.header
//     const token = authorization.replace('Bearer ', '')
//     // try catch 处理500错误 鉴权
//     try {
//         const user = jsonwebtoken.verify(token, secret)
//         ctx.state.user = user
//     } catch (err) {
//         ctx.throw(401, err.message)
//     }
//     await next()
// }
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

usersRouter.get('/:id/likingAnswers', listLikingAnswers)
usersRouter.put('/likingAnswers/:id', auth, checkAnswerExist, likeAnswer, undislikeAnswer) // 赞
usersRouter.del('/likingAnswers/:id', auth, checkAnswerExist, unlikeAnswer) // 取消赞

usersRouter.get('/:id/dislikingAnswers', listDislikingAnswers)
usersRouter.put('/dislikingAnswers/:id', auth, checkAnswerExist, dislikeAnswer, unlikeAnswer) 
usersRouter.del('/dislikingAnswers/:id', auth, checkAnswerExist, undislikeAnswer)

usersRouter.get('/:id/collectingAnswers', listCollectingAnswers)
usersRouter.put('/collectingAnswers/:id', auth, checkAnswerExist, collectAnswer) 
usersRouter.del('/collectingAnswers/:id', auth, checkAnswerExist, uncollectAnswer)
module.exports = usersRouter