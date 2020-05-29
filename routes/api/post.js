const Router = require('koa-router')
const router = new Router()

const Post = require('../../models/Post')
const passport = require('koa-passport')
const validatorPostInput = require('../../validation/post')

/**
 * @route GET /api/post/test
 * @desc 测试接口地址
 * @access 接口是公开的
 */
router.get('/test', async(ctx)=> {
    ctx.response.body = {
        status: 200,
        msg: 'test post koa interFaces'
    }
})

/**
 * @route POST /api/post
 * @desc 评论接口地址
 * @access 接口是私有的
 */
router.post('/', passport.authenticate('jwt',  { session: false }), async(ctx)=> {
    const {email, name} = ctx.state.user
    // 后端校验
    const {errors, isValid} = validatorPostInput(ctx.request.body)
    if(!isValid) {
        ctx.response.body={
            code: -1,
            msg: errors
        }
        return
    }

    // 组装数据，保存到数据库并返回
    const newPost = new Post({
        text: ctx.request.body.text,
        name,
        user: ctx.state.user.id
    })

    await newPost.save().then(() => {
        ctx.response.body = {
            code: 0,
            data: newPost
        }
    }).catch(err => {
        ctx.response.body = {
            code: -1,
            msg: err
        }
    })

})

/**
 * @route GET /api/post/all
 * @desc 评论接口列表地址
 * @access 接口是公开的
 */
router.get('/all', async(ctx)=> {
    const {page, size} = ctx.query
    const total = await Post.count()
    const skip = (Number(page) - 1) * Number(size)


    const posts = await Post.find().sort({'_id':-1}).skip(Number(skip)).limit(Number(size))
    if(posts.length > 0) {
        console.log('size', size)
        console.log('page', page)
        ctx.response.body = {
            code: 0,
            data: posts,
            page: parseInt(page),
            size: parseInt(size),
            total: parseInt(total)
        }
    }else {
        ctx.response.body = {
            code: 0,
            msg: '暂无评论'
        }
    }
})

/**
 * @route GET /api/post/findPostId?id=fdsf
 * @desc 根据id查询评论 接口地址
 * @access 接口是公开的
 */
router.get('/findPostId', async(ctx)=> {
    const id = ctx.query.id
    const newPost = await Post.findById({_id: id})
    if(newPost && newPost._id) {
        ctx.response.body = {
            code: 0,
            data: newPost
        }
    }else{
        ctx.response.body = {
            code: 0,
            msg: '没有该评论'
        }
    }
})


/**
 * @route GET /api/post/deleteId?id=fdsf
 * @desc 根据id删除评论 接口地址
 * @access 接口是私有的
 */
router.get('/deleteId', passport.authenticate('jwt',  { session: false }), async(ctx)=> {
    const id = ctx.query.id
    
    // 根据评论id 先查询数据库是否 存在
    const resPost = await Post.findById(id) // 直接传参数id 即可
    if(resPost && resPost._id) {
      
        // 存在，再判断是否是超级管理员 或者 本人
        
        if(ctx.state.user.email === 'onerosemary@163.com' || resPost.user === ctx.state.user.id) {
            // 删除
            await Post.remove({_id: id}).then(() => {
                ctx.response.body = {
                    code: 0,
                    msg: '删除评论成功'
                }
            })
        }else {
            ctx.response.body = {
                code: -1,
                msg: '非法操作'
            }
        }

    }else {
        ctx.response.body = {
            code: -1,
            msg: '暂无查询到你需要删除的评论'
        }
    }

})

/**
 * @route GET /api/post/like?id=fds
 * @desc 根据id评论点赞 接口地址
 * @access 接口是私有的
 */
router.get('/like', passport.authenticate('jwt',  { session: false }), async(ctx)=> {
    const id = ctx.query.id
    
    // 根据评论id 先查询数据库是否 存在
    const resPost = await Post.findById(id) // 直接传参数id 即可
    if(resPost && resPost._id) {
        // 存在，再判断是否点过赞
        const isLike = resPost.likes.filter((item) => String(item.user) === ctx.state.user.id).length > 0
        if(!isLike) {
            // 添加点赞用户id
            resPost.likes.unshift({
                user: ctx.state.user.id
            })
            // 更新数据库
            const updatePost = await Post.findOneAndUpdate({_id: id}, {$set: resPost}, {new: true})
            ctx.response.body = {
                code: 0,
                data: updatePost
            }

        }else { //点过赞
            ctx.response.body = {
                code: 0,
                msg: '已点过赞'
            }
        }

    }else {
        ctx.response.body = {
            code: -1,
            msg: '暂无查询到你需要点赞的评论'
        }
    }

})

/**
 * @route GET /api/post/unlike?id=fds
 * @desc 根据id评论取消点赞 接口地址
 * @access 接口是私有的
 */
router.get('/unlike', passport.authenticate('jwt',  { session: false }), async(ctx)=> {
    const id = ctx.query.id
    
    // 根据评论id 先查询数据库是否 存在
    const resPost = await Post.findById(id) // 直接传参数id 即可
    if(resPost && resPost._id) {
        // 存在，再判断是否点过赞
        const isLike = resPost.likes.filter((item) => String(item.user) === ctx.state.user.id).length > 0
        if(isLike) { // 点过赞
            // 查找索引，并删除
            const index = resPost.likes.map((item) => String(item.user)).indexOf(ctx.state.user.id)
            resPost.likes.splice(index, 1)

            // 更新数据库
            const updatePost = await Post.findOneAndUpdate({_id: id}, {$set: resPost}, {new: true})
            ctx.response.body = {
                code: 0,
                data: updatePost
            }

        }else { //没点过赞
            ctx.response.body = {
                code: 0,
                msg: '没点过赞'
            }
        }

    }else {
        ctx.response.body = {
            code: -1,
            msg: '暂无查询到你需要取消点赞的评论'
        }
    }

})

/**
 * @route POST /api/post/comment?id=fdsdfd
 * @desc 根据一级评论id，去添加二级评论接口地址
 * @access 接口是私有的
 */
router.post('/comment', passport.authenticate('jwt',  { session: false }), async(ctx)=> {
    const id = ctx.request.body.id
    const {email, name} = ctx.state.user
    // 后端校验
    const {errors, isValid} = validatorPostInput(ctx.request.body)
    if(!isValid) {
        ctx.response.body={
            code: -1,
            msg: errors
        }
        return
    }

    // 查询评论是否存在
    const resPost = await Post.findById(id)
    
    if(resPost && resPost._id) {
        // 组装评论数据
        const newPost = {
            text: ctx.request.body.text,
            name,
            user: ctx.state.user.id
        }

        resPost.comments.unshift(newPost)

        // 保存更新数据库
        const updatePost = await Post.findOneAndUpdate({_id: id}, {$set: resPost}, {new: true})
        ctx.response.body = {
            code: 0,
            data: updatePost
        }
    }else {
        ctx.response.body = {
            code: -1,
            msg: '一级评论id不存在'
        }
    }

})

/**
 * @route DELETE /api/post/commentDelete?id=fdsdfd&commentId=dfs
 * @desc 根据一级评论id，去删除二级评论接口地址
 * @access 接口是私有的
 */
router.delete('/commentDelete', passport.authenticate('jwt',  { session: false }), async(ctx)=> {
    const id = ctx.query.id // 一级评论id
    const commentId = ctx.query.commentId // 二级评论id

    // 查询评论是否存在
    const resPost = await Post.findById(id)
    
    if(resPost && resPost._id) {

        // 先查找索引，再删除
        const index = resPost.comments.map((item) => String(item._id)).indexOf(commentId)

        if(index >= 0) {
            resPost.comments.splice(index, 1)
            // 更新数据
            const updatePost = await Post.findOneAndUpdate({_id: id}, {$set: resPost}, {new: true})
            ctx.response.body = {
                code: 0,
                data: updatePost
            }
        }else{
            ctx.response.body = {
                code: -1,
                msg: '此二级评论不存在'
            }
        }

        
    }else {
        ctx.response.body = {
            code: -1,
            msg: '一级评论id不存在'
        }
    }

})
module.exports = router.routes()


