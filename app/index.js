const Koa = require('koa')
const path = require('path')
const koaStatic = require('koa-static')
const koaBody = require('koa-body')
const error = require('koa-json-error')
const parameter = require('koa-parameter')
const mongoose = require('mongoose')
const app = new Koa()
const routing = require('./routes')
const config = require('./config')
mongoose.connect(config.mongooseStr, { useNewUrlParser: true, useUnifiedTopology: true }, () => {
    console.log('Mongodb 链接成功')
})
mongoose.connection.on('error', (e) => {
    console.log('出错', e)
})
app.use(koaStatic(path.join(__dirname, 'public')))
app.use(error({
    postFormat: (e, {stack, ...rest}) => {
        return process.env.NODE_ENV === 'production' ? rest : {stack, ...rest}
    }
}))
app.use(koaBody({
    multipart: true,
    formidable: {
        uploadDir: path.join(__dirname, '/public/uploads'),
        keepExtensions: true
    }
}))
app.use(parameter(app))
routing(app)

app.listen(3000, () => {
    // console.log('启动成功')
})