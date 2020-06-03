const Koa = require('koa')
const Router = require('koa-router')
const mongoose = require('mongoose')
const bodyParser = require('koa-bodyparser')



// 全局设置hack, 解决提示警告问题
// findOneAndUpdate()内部会使用findAndModify驱动，驱动即将被废弃，所以弹出警告！
mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

const db = require('./config/keys').mongodbURI

// 引入 监听全局
const passport = require('koa-passport')

const app = new Koa()
const router = new Router()


// 配置上传文件的 静态目录
const path = require('path')
const staticFiles = require('koa-static')
app.use(staticFiles(path.join(__dirname ,'public')))


// 初始化并监听接口上方法 passport.authenticate('jwt', { session: false })
app.use(passport.initialize())
app.use(passport.session())

// 回调到config文件中的passport.js (避免app文件代码太多)
require('./config/passport')(passport)

// 引入user.js
const user = require('./routes/api/user')
// 引入article.js
const article = require('./routes/api/article')
// 引入post.js
const post = require('./routes/api/post')

// koa-bodyparser用于把formData数据解析到ctx.request.body
app.use(bodyParser())

// 连接数据库
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
    console.log('mongodb connected')
}).catch(err => {
    console.log(err)
})

// app.use(async(ctx) => {
//     ctx.response.body = {
//         'msg': 'hello Koa2'
//     }
// })


// 配置路由模块接口地址
// 接口地址 前缀 /api/user
router.use('/api/user', user)
router.use('/api/article', article)
router.use('/api/post', post)


// 注入路由
app.use(router.routes()).use(router.allowedMethods())

const port = process.env.PORT || 4001
app.listen(port, () => {
    console.log(`Server start on ${port}`)
})