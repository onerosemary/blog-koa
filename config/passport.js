const JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt
const keys = require('../config/keys')
// 引入 User模型表
const User = require('../models/User')


const opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.secretOrKey = keys.secretOrKey // 设置统一的key值

module.exports = (passport) => {
    // 把passport-jwt 注入 passport中 解析数据
    passport.use(new JwtStrategy(opts, async function(jwt_payload, done) {
        const user = await User.findById(jwt_payload.id) // findByiId(id) 返回是一个对象
        if(user){
            return done(null, user) // 返回出去, 内部赋值给了 ctx.state 
        }else {
            return done(null, false)
        }
    }));
}