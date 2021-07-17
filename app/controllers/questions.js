const Question = require('../models/questions')

class QuestionsCtl {
    async find (ctx) { 
        let {pageNum = 1, pageSize = 10} = ctx.query
        pageNum = +pageNum - 1
        pageSize = +pageSize
        const q = new RegExp(ctx.query.q)
        ctx.body = await Question.find({
            $or: [{title: q}, {description: q}] 
        }).limit(pageSize).skip(pageNum * pageSize) // skip从零开始 limit显示多少个
    }
    async checkQuestionExist (ctx, next) {
        const question = await Question.findById(ctx.params.id).select('+questioner')
        console.log('question', question)
        if (!question) {ctx.throw('404', '问题不存在')}
        ctx.state.question = question
        await next()
    }
    async findById (ctx) {
        const {fields = ''} = ctx.query
        const selectFields = fields.split(';').map(item => `+${item}`).join(' ')
        const question = await Question.findById(ctx.params.id).select(selectFields).populate('questioner topics') // 过滤字段select('+business +headline')
        if (!question) {ctx.throw('404', '问题不存在')}
        ctx.body = question
    }
    async create (ctx) {
        ctx.verifyParams({
            title: {type: 'string', required: true},
            description: {type: 'string', required: false}
        })
        const topic = await new Question({
            ...ctx.request.body,
            questioner: ctx.state.user._id
        }).save()
        ctx.body = topic
    }
    async checkQuestioner (ctx, next) {
        const {question} = ctx.state
        if (question.questioner.toString() !== ctx.state.user._id) {
            ctx.throw(403, '没有权限')
        }
        await next()
    }
    async update (ctx) {
        ctx.verifyParams({
            title: {type: 'string', required: false},
            description: {type: 'string', required: false}
        })
        console.log('11', ctx.request.body)
        await ctx.state.question.update(ctx.request.body)
        ctx.body = ctx.state.question
    }
    async delete (ctx) {
        const user = await Question.findByIdAndRemove(ctx.params.id)
        if (!user) {ctx.throw('404', '问题不存在')}
        ctx.status = 204
    }
}
module.exports = new QuestionsCtl