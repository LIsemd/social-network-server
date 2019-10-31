const Koa = require('koa');
const app = new Koa()
/********************内部中间件*************************/
const path = require('path')

/********************外部中间件*************************/
const error = require('koa-json-error')
const koaBody = require('koa-body')
const parameter = require('koa-parameter')
const koaStatic = require('koa-static')

/********************路由*************************/
const routing = require('./routes')

/********************配置数据库*************************/
const mongoose = require('mongoose')
const { mongodb } = require('./config')
mongoose.connect(mongodb, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
})
mongoose.connection.on('connected', () => {
    console.log('数据库连接成功！')
})
mongoose.connection.on('error', () => {
    console.log('数据库连接失败！')
})

app.use(koaStatic(path.join(__dirname, 'public')))
app.use(error({ postFormat: (err, { stack, ...rest }) => process.env.NODE_ENV === 'production' ? rest : { stack, ...rest } }))
app.use(koaBody({
    multipart: true,
    formidable: {
        uploadDir: path.join(__dirname + "/public/uploads"),
        keepExtensions: true
    }
}))
app.use(parameter(app))
routing(app)

app.listen(3000, () => {
    console.log('程序启动成功！');
});