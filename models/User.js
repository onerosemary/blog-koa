const mongoose = require('mongoose')
const Schema = mongoose.Schema

// 实例化模板
// 创建注册接口 设置字段
const UserSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

// 导出user model
// 表名为 users
// UserSchema为模板
module.exports = User = mongoose.model('users', UserSchema)