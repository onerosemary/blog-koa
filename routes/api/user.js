const Router = require('koa-router')

const router = new Router()
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const config = require('../../config/keys')
const User = require('../../models/User')
const tools = require('../../config/tools')

const bcrypt = require('bcryptjs')
const passport = require('koa-passport')


// 引入register 校验
const validatorRegisterInput = require('../../validation/register')

// 引入findPassword 校验
const validatorFindPasswordInput = require('../../validation/findPassword')


//引入login 校验
const validatorLoginInput = require('../../validation/login')

// 存储邮箱验证code 与 时间间隔
let emailCode = '',
    emailExpire = ''

/**
 * @route GET api/user/test
 * @desc 测试接口
 * @access 接口是公开的
 */

 router.get('/test', async(ctx) => {
     ctx.response.body = {
         msg: 'test koa interFaces'
     }
 })

 /**
 * @route POST api/user/register
 * @desc 注册接口
 * @access 接口是公开的
 */
router.post('/register', async(ctx) => {
    const {email, name, code, password} = ctx.request.body
    // 后端校验
    const {errors, isValid} = validatorRegisterInput(ctx.request.body)
    if(!isValid) {
        ctx.response.body = errors
        return
    }
    // 校验邮箱验证code是否正确
    if(!code){
        ctx.response.body = {
            code: -1,
            msg: '邮箱校验码不能为空'
        }
        return
    }else if(emailCode !== code) {
        ctx.response.body = {
            code: -1,
            msg: '邮箱校验码不正确'
        }
        return
    }
    // 先查数据库表是否存在
    const resultFind = await User.find({email: email})

    if(resultFind.length > 0){ // 存在
        ctx.response.body = {
            code: -1,
            msg: 'email已经注册'
        }
    }else{ // 注册
        const newUser = new User({
            email,
            name,
            password: tools.enbcrypt(password) // 加密
        })
        // 写入数据库
        await newUser.save().then((user) => {
            ctx.response.body = {
                code: 0,
                msg: '账号注册成功',
                id: user.id,
                email: user.email,
                name: user.name,
                password: user.password,
                date: user.date
            }
        }).catch(err => {
            ctx.response.body = {
                code: -1,
                msg: '注册失败'
            }
        })
    }
})

/**
 * @route POST api/user/emailVerify
 * @desc 邮箱验证接口
 * @access 接口是公开的
 */

router.post('/emailVerify', async(ctx) => {
    const { email } = ctx.request.body
    // 校验是不是一分钟之内
    if (emailExpire && new Date().getTime() - emailExpire < 0) {
        ctx.body = {
            code: -1,
            msg: '验证请求过于频繁，5分钟内1次'
        }
        return false
    }
    await nodemailer.createTestAccount((err, account) => {
        let transporter = nodemailer.createTransport({
            host: config.smtp.host,
            port: 465,
            secure: true,
            auth: {
                user: config.smtp.user,
                pass: config.smtp.pass
            }
        })
        //接受端信息
        let ko = {
            code: config.smtp.code(),
            expire: config.smtp.expire(),
            email,
            user: email
        }
        // setup email data with unicode symbols
        let mailOptions = {
            from: config.smtp.user, // sender address
            to: ko.email, // list of receivers
            subject: '标题：向瑞平博客', // Subject line
            html: `您好，您正在《向瑞平博客网站》注册，验证码是：${ko.code}` // html body
        }
    
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            
            if(info.messageId){
                console.log('邮箱验证码发送成功', ko.code)
                // 存储 code 与 过期时间
                emailCode = ko.code
                emailExpire = ko.expire
            }
            
        })
        
    })
    // ctx返回值
    ctx.response.body = {
        code: 0,
        msg: '验证码发送成功'
    }
})


/**
 * @route POST api/user/findPassword
 * @desc 找回密码接口
 * @access 接口是公开的
 */

router.post('/findPassword', async(ctx) => {
    const {email, code, password} = ctx.request.body
    // 后端校验
    const {errors, isValid} = validatorFindPasswordInput(ctx.request.body)
    if(!isValid) {
        ctx.response.body = errors
        return
    }
    // 校验邮箱验证code是否正确
    if(!code){
        ctx.response.body = {
            code: -1,
            msg: '邮箱校验码不能为空'
        }
        return
    }else if(emailCode !== code) {
        ctx.response.body = {
            code: -1,
            msg: '邮箱校验码不正确'
        }
        return
    }
    // 先查找数据库是否有此邮箱
    const resultFind = await User.find({email:email})
    if(resultFind.length > 0){ // 存在此用户
        const updateUser = await User.findOneAndUpdate({email: email},  {$set:{password: tools.enbcrypt(password)}})
        if(updateUser.email) {
            ctx.response.body = {
                code: 0,
                msg: '密码修改成功'
            }
        }
    }else { // 不存在此用户
        ctx.response.body = {
            code: -1,
            msg: '用户不存在'
        }
    }
})

/**
 * @route POST api/user/login
 * @desc 登录接口
 * @access 接口是公开的
 */

router.post('/login', async(ctx) => {
    const {email, password} = ctx.request.body
    console.log('ctx.request.body', ctx.request.body)

    // 后端校验
    const {errors, isValid} = validatorLoginInput(ctx.request.body)
    if(!isValid) {
        ctx.response.body = {
            code: -1,
            errors
        }
        return
    }

    // 查询email 在数据库是否存在
    const resultFind = await User.find({email})
    if(resultFind.length > 0) { //存在数据库
        // 匹配密码是否正确
        const isCompare = bcrypt.compareSync(password, resultFind[0].password)
        // 生成token
        const tokenMsg = {
            id: resultFind[0].id,
            email: resultFind[0].email
        }
        const token = await jwt.sign(tokenMsg, config.secretOrKey, {expiresIn: 60000 * 60 * 24})
        if(isCompare) {
            const Token = 'Bearer ' + token
            await ctx.cookies.set('blog_token', Token, { // 服务端返回 cookie给客户端 nuxtServerInit
                maxAge: 60000 * 60 * 24,
                secure: false,
                httpOnly: false, // 是否只是服务器可访问 cookie, 默认是 true
            }) 
            //  根据email 查询用户信息 并返回给前端
            const userMsg = await User.find({email: email})
            let userInfo1 = {}
            if(userMsg.length > 0){
                userInfo1 = userMsg[0]

                // 处理cookies中文编码报错
                // 前端使用 decodeURIComponent 解码
                userInfo1.name = encodeURIComponent(userInfo1.name)
                ctx.cookies.set('userInfo', JSON.stringify(userInfo1), { // 服务端返回 用户信息给客户端 nuxtServerInit
                    maxAge: 60000 * 60 * 24,
                    secure: false,
                    httpOnly: false, // 是否只是服务器可访问 cookie, 默认是 true
                }) 
            }
            
            ctx.response.body = {
                code: 0,
                token: Token,
                userInfo: userInfo1
            }
        }else {
            ctx.response.body = {
                code: -1,
                msg: '密码错误'
            }
        }

    }else { // 不存在
        ctx.response.body = {
            code: -1,
            msg: '用户名不存在'
        }
    }

})

/**
 * @route GET api/user/current
 * @desc 获取用户信息接口
 * @access 接口是私有的
 */

router.get('/current', passport.authenticate('jwt',  { session: false }), async(ctx) => {
    const { id, email, date } = ctx.state.user
    ctx.response.body = {
        code: 1,
        id,
        email,
        date
    }
})

 module.exports = router.routes()