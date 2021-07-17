const jsonwebtoken = require('jsonwebtoken')
const User = require('../models/users')
const Question = require('../models/questions')
const Answer = require('../models/answers')
const { secret } = require('../config')
// 401 没有认证
class Users {
    async find (ctx) {
        let {pageNum = 1, pageSize = 10} = ctx.query
        pageNum = +pageNum - 1
        pageSize = +pageSize
        ctx.body = await User.find({
            name: new RegExp(ctx.query.q)
        }).limit(pageSize).skip(pageNum * pageSize) // skip从零开始 limit显示多少个
    }
    async findById (ctx) {
        const {fields = ''} = ctx.query
        const selectFields = fields.split(';').map(item => `+${item}`).join(' ')
        const populateStr = fields.split(';').map(item => {
            if (item === 'employments') return 'employments.company employments.job'
            if (item === 'educations') return 'educations.school educations.major'
            return item
        }).join(' ')
        console.log(selectFields, populateStr) // 这里会报错fields=locations;headline
        const user = await User.findById(ctx.params.id).select(selectFields).populate(populateStr) // 过滤字段select('+business +headline')
        if (!user) {ctx.throw('404', '用户不存在')}
        ctx.body = user
    }
    async checkOwner (ctx, next) {
        if (ctx.params.id !== ctx.state.user._id) {
            ctx.throw(403, '没有权限')
        }
        await next()
    }
    async checkUserExist (ctx, next) {
        const user = await User.findById(ctx.params.id)
        if (!user) {ctx.throw('404', '用户不存在')}
        await next()
    }
    async create (ctx) {
        ctx.verifyParams({
            name: {type: 'string', required: true},
            password: {type: 'string', required: true}
        })
        const { name } = ctx.request.body
        const repeated = await User.findOne({name})
        if (repeated) { ctx.throw(409, '用户已经存在')}
        const user = await new User(ctx.request.body).save()
        ctx.body = user
    }
    async update (ctx) {
        ctx.verifyParams({
            name: {type: 'string', required: false},
            password: {type: 'string', required: false},
            avatar_url: {type: 'string', required: false},
            gender: {type: 'string', required: false},
            headline: {type: 'string', required: false},
            locations: {type: 'array', itemType: 'string', required: false},
            business: {type: 'string', required: false},
            employments: {type: 'array',itemType: 'object', required: false},
            educations: {type: 'array',itemType: 'object', required: false},
        })
        const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body)
        if (!user) {
            ctx.throw('404', '用户不存在')
        }
        ctx.body = user
    }
    async delete (ctx) {
        const user = await User.findByIdAndRemove(ctx.params.id)
        if (!user) {ctx.throw('404', '用户不存在')}
        ctx.status = 204
    }
    async login (ctx) {
        ctx.verifyParams({
            name: {type: 'string', required: true},
            password: {type: 'string', required: true}
        })
        const user = await User.findOne(ctx.request.body)
        if (!user) {ctx.throw(401, '用户名或密码不正确')}
        const {_id, name} = user
        const token = jsonwebtoken.sign({_id, name}, secret, {expiresIn: '1d'})
        ctx.body = {token}
    }
    async listFollowing (ctx) { // 查询某个用户关注的列表
        const user = await User.findById(ctx.params.id).select('+following').populate('following')
        if (!user) {ctx.throw(404, '用户不存在')}
        ctx.body = user.following
    }
    async listFollower (ctx) {
        const users = await User.find({following: ctx.params.id}) // 某个用户粉丝列表，
        ctx.body = users
    }
    async follow (ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following') // 这是我的
        if (!me.following.map(id => id.toString()).includes(ctx.params.id)) { 
            me.following.push(ctx.params.id) // 这是别人的id
            me.save()
        }
        ctx.status = 204
    }
    async unfollow (ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following') // 这是我的
        const styArr = me.following.map(id => id.toString())
        const index = styArr.indexOf(ctx.params.id)
        if (index > -1) { 
            me.following.splice(index, 1) // 这是别人的id
            me.save()
        }
        ctx.status = 204
    }
    async listFollowingTopics (ctx) {
        const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics')
        if (!user) {ctx.throw(404, '用户不存在')}
        ctx.body = user.followingTopics
    }
    async followTopics (ctx) {
        const me = await User.findById(ctx.state.user._id).select('+followingTopics') // 这是我的
        if (!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)) { 
            me.followingTopics.push(ctx.params.id) // 这是别人的id
            me.save()
        }
        ctx.status = 204
    }
    async unfollowTopics (ctx) {
        const me = await User.findById(ctx.state.user._id).select('+followingTopics') // 这是我的
        const styArr = me.followingTopics.map(id => id.toString())
        const index = styArr.indexOf(ctx.params.id)
        if (index > -1) { 
            me.followingTopics.splice(index, 1) // 这是别人的id
            me.save()
        }
        ctx.status = 204
    }
    async listQuestions (ctx) {
        const questions = await Question.find({
            questioner: ctx.params.id
        })
        ctx.body = questions
    }
    async listLikingAnswers (ctx) {
        const user = await User.findById(ctx.params.id).select('+likingAnswers').populate('likingAnswers')
        if (!user) {ctx.throw(404, '用户不存在')}
        ctx.body = user.likingAnswers
    }
    async likeAnswer (ctx, next) {
        const me = await User.findById(ctx.state.user._id).select('+likingAnswers') // 这是我的
        
        if (!me.likingAnswers.map(id => id.toString()).includes(ctx.params.id)) { 
            me.likingAnswers.push(ctx.params.id) // 这是别人的id
            me.save()
            await Answer.findByIdAndUpdate(ctx.params.id, {
                $inc: {voteCount: 1}
            })
        }
        ctx.status = 204
        await next()
    }
    async unlikeAnswer (ctx) {
        const me = await User.findById(ctx.state.user._id).select('+likingAnswers') // 这是我的
        const styArr = me.likingAnswers.map(id => id.toString())
        const index = styArr.indexOf(ctx.params.id)
        if (index > -1) { 
            me.likingAnswers.splice(index, 1) // 这是别人的id
            me.save()
            await Answer.findByIdAndUpdate(ctx.params.id, {
                $inc: {voteCount: -1}
            })
        }
        ctx.status = 204
    }

    async listDislikingAnswers (ctx) {
        const user = await User.findById(ctx.params.id).select('+dislikingAnswers').populate('dislikingAnswers')
        if (!user) {ctx.throw(404, '用户不存在')}
        ctx.body = user.dislikingAnswers
    }
    async dislikeAnswer (ctx, next) {
        const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers') // 这是我的
        if (!me.dislikingAnswers.map(id => id.toString()).includes(ctx.params.id)) { 
            me.dislikingAnswers.push(ctx.params.id) // 这是别人的id
            me.save()
        }
        ctx.status = 204
        await next()
    }
    async undislikeAnswer (ctx) {
        const me = await User.findById(ctx.state.user._id).select('+dislikingAnswers') // 这是我的
        const styArr = me.dislikingAnswers.map(id => id.toString())
        const index = styArr.indexOf(ctx.params.id)
        if (index > -1) { 
            me.dislikingAnswers.splice(index, 1) // 这是别人的id
            me.save()
        }
        ctx.status = 204
    }

    async listCollectingAnswers (ctx) {
        const user = await User.findById(ctx.params.id).select('+collectingAnswers').populate('collectingAnswers')
        if (!user) {ctx.throw(404, '用户不存在')}
        ctx.body = user.collectingAnswers
    }
    async collectAnswer (ctx, next) {
        const me = await User.findById(ctx.state.user._id).select('+collectingAnswers') // 这是我的
        if (!me.collectingAnswers.map(id => id.toString()).includes(ctx.params.id)) { 
            me.collectingAnswers.push(ctx.params.id) // 这是别人的id
            me.save()
        }
        ctx.status = 204
        await next()
    }
    async uncollectAnswer (ctx) {
        const me = await User.findById(ctx.state.user._id).select('+collectingAnswers') // 这是我的
        const styArr = me.collectingAnswers.map(id => id.toString())
        const index = styArr.indexOf(ctx.params.id)
        if (index > -1) { 
            me.collectingAnswers.splice(index, 1) // 这是别人的id
            me.save()
        }
        ctx.status = 204
    }
}
module.exports = new Users