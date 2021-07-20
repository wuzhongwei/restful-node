const Answer = require('../models/answers')

class AnswersCtl {
    async find (ctx) { 
        let {pageNum = 1, pageSize = 10} = ctx.query
        pageNum = +pageNum - 1
        pageSize = +pageSize
        const q = new RegExp(ctx.query.q)
        ctx.body = await Answer.find({
            content: q,
            questionId: ctx.params.questionId
        }).limit(pageSize).skip(pageNum * pageSize) // skip从零开始 limit显示多少个
    }
    async checkAnswerExist (ctx, next) {
        const answer = await Answer.findById(ctx.params.id).select('+answerer')
        if (!answer) {ctx.throw('404', '答案不存在')}
        // 只有删改查答案时候才检查此逻辑,赞、踩答案时候不检查
        if (ctx.params.questionId && ctx.params.questionId !== answer.questionId.toString()) {
            ctx.throw('404', '该问题下没有此答案')
        }
        ctx.state.answer = answer
        await next()
    }
    async findById (ctx) {
        const {fields = ''} = ctx.query
        const selectFields = fields.split(';').map(item => `+${item}`).join(' ')
        const answer = await Answer.findById(ctx.params.id).select(selectFields).populate('answerer') // 过滤字段select('+business +headline')
        ctx.body = answer
    }
    async create (ctx) {
        ctx.verifyParams({
            content: {type: 'string', required: true}
        })
        const answerer = await new Answer({
            ...ctx.request.body,
            answerer: ctx.state.user._id,
            questionId: ctx.params.questionId
        }).save()
        ctx.body = answerer
    }
    async checkAnswerer (ctx, next) {
        const {answer} = ctx.state
        if (answer.answerer.toString() !== ctx.state.user._id) {
            ctx.throw(403, '没有权限')
        }
        await next()
    }
    async update (ctx) {
        ctx.verifyParams({
            content: {type: 'string', required: false}
        })
        await ctx.state.answer.update(ctx.request.body)
        ctx.body = ctx.state.answer
    }
    async delete (ctx) {
        const user = await Answer.findByIdAndRemove(ctx.params.id)
        if (!user) {ctx.throw('404', '问题不存在')}
        ctx.status = 204
    }
}
module.exports = new AnswersCtl