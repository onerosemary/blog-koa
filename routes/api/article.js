const Router = require('koa-router')

const router = new Router()

const Article = require('../../models/Article')

const validatorArticleInput = require('../../validation/article')

const multer = require('koa-multer') // 加载koa-multer模块

/**
 * @route GET api/article/test
 * @desc 测试接口
 * @access 接口是公开的
 */

router.get('/test', async(ctx) => {
    ctx.response.body = {
        msg: 'test article interFaces'
    }
})

/**
 * @route GET api/article/type
 * @desc 文章分类接口
 * @access 接口是公开的
 */

router.get('/type', async(ctx) => {
    const typeList = [{
        id: 0,
        name: '全部'
    },{
        id: 1,
        name: 'Javascript'
    },{
        id: 2,
        name: 'Vue'
    },{
        id: 3,
        name: 'Koa2'
    },{
        id: 4,
        name: 'H5'
    },{
        id: 5,
        name: 'Css3'
    }]
    ctx.response.body = {
        code: 0,
        data: typeList
    }
})

/**
 * @route POST api/article/add
 * @desc 文章添加接口
 * @access 接口是公开的
 */

router.post('/add', async(ctx) => {
    const {cover, title, sub, type, looks, author, content} = ctx.request.body
    
    // 后端校验
    const {errors, isValid} = validatorArticleInput(ctx.request.body)
    if(!isValid) {
        ctx.response.body = {
            errors
        }
        return
    }
    console.log('ctx.request.body', ctx.request.body)
    // 组装数据模型
    const newArticle = new Article({
        cover,
        title,
        sub,
        type,
        isnew: 0,
        looks,
        author,
        content
    })

    // 保存并返回
    await newArticle.save().then(res =>{
        ctx.response.body = {
            code: 0,
            data: res
        }
    }).catch(err => {
        console.log('err', err)
        ctx.response.body = {
            code: -1,
            'msg': '文章添加失败'
        }
    })
})

/**
 * @route POST api/article/update
 * @desc 文章编辑接口
 * @access 接口是公开的
 */

router.post('/update', async(ctx) => {
    const {id, title, sub, type, looks, author, content} = ctx.request.body
   
    // 后端校验
    const {errors, isValid} = validatorArticleInput(ctx.request.body)
    if(!isValid) {
        ctx.response.body = {
            errors
        }
        return
    }
    // 根据id先查询表是否存在文章
    const findArticle = await Article.findById({_id: id})
    if(findArticle._id) { // 文章存在
        // 更新并返回
        const newArticle = await Article.findOneAndUpdate({_id: id}, {$set: ctx.request.body}, {new: true})
        ctx.response.body = {
            code: 0,
            data: newArticle
        }
    }else {
        ctx.response.body = {
            code: -1,
            'msg': '文章不存在'
        }
    }

})


/**
 * @route GET api/article/del
 * @desc 文章删除接口
 * @access 接口是公开的
 */

router.get('/del', async(ctx) => {
    const id = ctx.query.id
    if(id) {
        // 更新数据
        const updateArticle = await Article.findOneAndRemove({_id: id})
        ctx.response.body = {
            code: 0,
            data: updateArticle
        }
    }else {
        ctx.response.body = {
            code: -1,
            msg: 'id不存在'
        }
    }
    

})


/**
 * @route GET api/article/detail?id=aaa
 * @desc 文章查询详情接口
 * @access 接口是公开的
 */

router.get('/detail', async(ctx) => {
    const id = ctx.query.id
    
    // 先查询表，是否存在此文章id
    const findArticle = await Article.findById({_id: id})
    if(findArticle._id) { // 存在并返回 
        ctx.response.body = {
            code: 0,
            data: findArticle
        }
    }else {
        ctx.response.body = {
            code: 1,
            msg: '此id文章不存在'
        }
    }
    
})

/**
 * @route POST api/article/list
 * @desc 文章列表接口
 * @access 接口是公开的
 */

router.post('/list', async(ctx) => {
    const {type, page, size} = ctx.request.body
    let total= 0
    if(parseInt(type) === 0) {
        total = await Article.count() // 表总记录数
    }else {
        total = await Article.count({type: type}) // 表总记录数
    }
    
    
    const skip = (page-1)*size
    // let listArticle = await Article.find({type: type}).skip(skip).limit(size)


    // 先查询表
    let listArticle = []
    if(parseInt(type) === 0 || type === null || type === undefined) {
        listArticle = await Article.find().sort({'date': -1}).skip(Number(skip)).limit(Number(size))
    }else {
        listArticle = await Article.find({type: type}).skip(Number(skip)).limit(Number(size))
    }
    

    ctx.response.body = {
        code: 0,
        data: listArticle,
        page: parseInt(page),
        size: parseInt(size),
        total: parseInt(total)
    }
})

/**
 * @route GET api/article/isNew
 * @desc 推荐文章到首页接口
 * @access 接口是公开的
 */

router.get('/isNew', async(ctx) => {
    // 1 是推荐首页， 0 是取消推荐首页
    const {id, isnew} = ctx.query
    const findArticle = await Article.findById({_id: id})
    if(findArticle._id) {
        // 更新
        const newArticle = await Article.findOneAndUpdate({_id:id}, {$set: {isnew: isnew}}, {new: true})
        ctx.response.body = {
            code: 0,
            data: newArticle
        }
    }else {
        ctx.response.body = {
            code: -1,
            'msg': '文章不存在'
        }
    }

})

/**
 * @route GET api/article/homeList
 * @desc 查询首页推荐文章接口
 * @access 接口是公开的
 */

router.get('/homeList', async(ctx) => {
    const findArticle = await Article.find({isnew: 1})
    if(findArticle.length > 0) {
        ctx.response.body = {
            code: 0,
            data: findArticle
        }
    }else {
        ctx.response.body = {
            code: -1,
            'msg': '暂无推荐文章'
        }
    }

})

/**
 * @route POST api/article/searchList
 * @desc 搜索文章列表接口
 * @access 接口是公开的
 */

router.post('/searchList', async(ctx) => {
    const {keyword, page, size} = ctx.request.body
    
    // 关键词 模糊查询
    const _filter = {$or: [  // 多字段同时匹配
        {title: {$regex: keyword}},
        {content: {$regex: keyword, $options: '$i'}}, //  $options: '$i' 忽略大小写
    ]}
    let total = await Article.count(_filter) 
    
    const skip = (page-1)*size

    // 先查询表
    let listArticle = await Article.find(_filter).skip(Number(skip)).limit(Number(size))
    

    if(listArticle.length > 0) {
        ctx.response.body = {
            code: 0,
            data: listArticle,
            page: parseInt(page),
            size: parseInt(size),
            total: parseInt(total)
        }
    }else {
        ctx.response.body = {
            code: -1,
            msg: '搜索不到关键词内容'
        }
    }
})

/**
 * @route GET api/article/looksList
 * @desc 首页热文推荐
 * @access 接口是公开的
 */

router.get('/looksList', async(ctx) => {
    const hotArticles =  await Article.find().sort({looks: -1}).skip(0).limit(6)
    if(hotArticles.length > 0) {
        ctx.response.body = {
            code: 0,
            data: hotArticles
        }
    }else {
        ctx.response.body = {
            code: -1,
            msg: '暂无热文'
        }
    }
})


/**
 * @route POST api/article/uploadfile
 * @desc 图片上传接口
 * @access 接口是公开的
 */

// 配置
var storage = multer.diskStorage({
    // 文件保存路径
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/')
    },
    // 修改文件名称
    filename: function (req, file, cb) {
      var fileFormat = (file.originalname).split(".");
      cb(null,Date.now() + "." + fileFormat[fileFormat.length - 1]);
    }
  })

  // 加载配置
  var upload = multer({ storage: storage })

router.post('/uploadfile', upload.single('file'), async(ctx) => {
    // 访问需要再使用koa-static在app.js中 配置指定静态目录 才可以访问
    // http://localhost:4000/uploads/1589721366459.png
    ctx.response.body = {
        data: ctx.req.file
    }
})


module.exports = router.routes()