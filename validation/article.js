const Validator = require('validator')
const isEmpty = require('./is-empty')

module.exports = function validatorArticleInput(data) {
    let errors = {}
    
    data.title = !isEmpty(data.title) ? data.title : ''
    data.type = !isEmpty(data.type) ? data.type : ''
    data.content = !isEmpty(data.content) ? data.content : ''
 
   
    if(Validator.isEmpty(data.title)) {
        errors.title = '文章标题不能为空'
    }else if(!Validator.isLength(data.title, {min: 6, max: 30})) {
        errors.title = '文章标题长度不能小于6位,并不能大于30位'
    }

    if(Validator.isEmpty(data.type)) {
        errors.type = '文章分类不能为空'
    }

    if(Validator.isEmpty(data.content)) {
        errors.content = '文章内容不能为空'
    }

    return {
        errors,
        isValid: isEmpty(errors)
    }
}