const Comment = require('../models/comments')

class commentsCtl {
    async find (ctx) { 
        let {pageNum = 1, pageSize = 10} = ctx.query
        pageNum = +pageNum - 1
        pageSize = +pageSize
        const q = new RegExp(ctx.query.q)
        const {questionId, answerId} = ctx.params
        const {rootCommentId} = ctx.query
        ctx.body = await Comment.find({
            content: q,
            questionId, answerId,
            rootCommentId
        }).limit(pageSize).skip(pageNum * pageSize).populate('commentator replyTo') // skip从零开始 limit显示多少个
    }
    async checkCommentExist (ctx, next) {
        const comment = await Comment.findById(ctx.params.id).select('+commentator')
        if (!comment) {ctx.throw('404', '评论不存在')}
        if (ctx.params.questionId && ctx.params.questionId !== comment.questionId.toString()) {
            ctx.throw('404', '该问题下没有此评论')
        }
        if (ctx.params.answerId && ctx.params.answerId !== comment.answerId.toString()) {
            ctx.throw('404', '该答案下没有此评论')
        }
        ctx.state.comment = comment
        await next()
    }
    async findById (ctx) {
        const {fields = ''} = ctx.query
        const selectFields = fields.split(';').map(item => `+${item}`).join(' ')
        const comment = await Comment.findById(ctx.params.id).select(selectFields).populate('commentator') // 过滤字段select('+business +headline')
        if (!comment) {ctx.throw('404', '问题不存在')}
        ctx.body = comment
    }
    async create (ctx) {
        ctx.verifyParams({
            content: {type: 'string', required: true},
            rootCommentId: {type: 'string', required: false},
            replyTo: {type: 'string', required: false}
        })
        console.log(777)
        const comment = await new Comment({
            ...ctx.request.body,
            commentator: ctx.state.user._id,
            questionId: ctx.params.questionId,
            answerId: ctx.params.answerId
        }).save()
        ctx.body = comment
    }
    async checkCommentator (ctx, next) {
        const {comment} = ctx.state
        if (comment.commentator.toString() !== ctx.state.user._id) {
            ctx.throw(403, '没有权限')
        }
        await next()
    }
    async update (ctx) {
        ctx.verifyParams({
            content: {type: 'string', required: false}
        })
        const {content} = ctx.request.body
        await ctx.state.comment.update({content})
        ctx.body = ctx.state.comment
    }
    async delete (ctx) {
        const user = await Comment.findByIdAndRemove(ctx.params.id)
        if (!user) {ctx.throw('404', '问题不存在')}
        ctx.status = 204
    }
}
module.exports = new commentsCtl