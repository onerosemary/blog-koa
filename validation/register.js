const Validator = require('validator')
const isEmpty = require('./is-empty')

module.exports = function validatorRegisterInput(data) {
    let errors = {}
    
    data.email = !isEmpty(data.email) ? data.email : ''
    data.name = !isEmpty(data.name) ? data.name : ''
    data.password = !isEmpty(data.password) ? data.password : ''
    // data.password2 = !isEmpty(data.password2) ? data.password2 : ''
   
    if(Validator.isEmpty(data.email)) {
        errors.email = '邮箱不能为空'
    }else if(!Validator.isEmail(data.email)) {
        errors.email = '邮箱不合法'
    }

    if(Validator.isEmpty(data.name)) {
        errors.name = '用户名不能为空'
    }else if(!Validator.isLength(data.name, {min: 2, max: 30})) {
        errors.email = '用户名长度不能小于2位,并不能大于30位'
    }

    if(Validator.isEmpty(data.password)) {
        errors.password = '密码不能为空'
    }else if(!Validator.isLength(data.password, {min: 6, max: 30})) {
        errors.password = '密码长度不能小于6位,并不能大于30位'
    }

    // if(Validator.isEmpty(data.password2)) {
    //     errors.password2 = '确认密码不能为空'
    // }else if(!Validator.equals(data.password, data.password2)) {
    //     errors.password2 = '2次密码输入不一致'
    // }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}