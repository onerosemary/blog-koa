const Validator = require('validator')
const isEmpty = require('./is-empty')

module.exports = function validatorPostInput(data) {
    let errors = {}
    
    data.text = !isEmpty(data.text) ? data.text : ''
 
   
    if(Validator.isEmpty(data.text)) {
        errors.text = '评论内容不能为空'
    }


    return {
        errors,
        isValid: isEmpty(errors)
    }
}