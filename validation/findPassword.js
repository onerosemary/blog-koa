const Validator = require('validator')
const isEmpty = require('./is-empty')

module.exports = function validatorFindPasswordInput(data) {
    let errors = {}
    
    data.email = !isEmpty(data.email) ? data.email : ''
    data.password = !isEmpty(data.password) ? data.password : ''
   
    if(Validator.isEmpty(data.email)) {
        errors.email = '邮箱不能为空'
    }else if(!Validator.isEmail(data.email)) {
        errors.email = '邮箱不合法'
    }

    if(Validator.isEmpty(data.password)) {
        errors.password = '密码不能为空'
    }else if(!Validator.isLength(data.password, {min: 6, max: 30})) {
        errors.password = '密码长度不能小于6位,并不能大于30位'
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}