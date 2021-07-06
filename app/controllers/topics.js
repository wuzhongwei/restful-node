const Topics = require('../models/topics')
const User = require('../models/users')
class TopicsCtl {
    async find (ctx) { 
        let {pageNum = 1, pageSize = 10} = ctx.query
        pageNum = +pageNum - 1
        pageSize = +pageSize
        ctx.body = await Topics.find({
            name: new RegExp(ctx.query.q)
        }).limit(pageSize).skip(pageNum * pageSize) // skip从零开始 limit显示多少个
    }
    async checkTopicsExist (ctx, next) {
        const topics = await Topics.findById(ctx.params.id)
        if (!topics) {ctx.throw('404', '话题不存在')}
        await next()
    }
    async findById (ctx) {
        const {fields = ''} = ctx.query
        const selectFields = fields.split(';').map(item => `+${item}`).join(' ')
        const topics = await Topics.findById(ctx.params.id).select(selectFields) // 过滤字段select('+business +headline')
        if (!topics) {ctx.throw('404', '不存在话题')}
        ctx.body = topics
    }
    async create (ctx) {
        ctx.verifyParams({
            name: {type: 'string', required: true},
            avatar_url: {type: 'string', required: false},
            introduction: {type: 'string', required: false},
        })
        const topic = await new Topics(ctx.request.body).save()
        ctx.body = topic
    }
    async update (ctx) {
        ctx.verifyParams({
            name: {type: 'string', required: false},
            avatar_url: {type: 'string', required: false},
            introduction: {type: 'string', required: false},
        })
        const topic = await Topics.findByIdAndUpdate(ctx.params.id, ctx.request.body)
        ctx.body = topic
    }
    async listTopicsFollower (ctx) { // 获取话题下的粉丝
        const users = await User.find({followingTopics: ctx.params.id})
        ctx.body = users
    }
}
module.exports = new TopicsCtl