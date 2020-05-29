module.exports = {
    mongodbURI: 'mongodb://127.0.0.1:27017/blog2',
    secretOrKey: 'secretblog',
    smtp: {
        get host() {
            return 'smtp.163.com'
        },
        get user() {
            return 'xiangruipingboke@163.com'
        },
        get pass() {
            return 'KSTMHDCGLREQUFBO'
        },
        get code() {
            return () => {
                return Math.random().toString(16).slice(2, 6).toUpperCase()
            }
        },
        get expire() {
            return () => {
                return new Date().getTime() + 300 * 1000 // 5分钟
            }
        }
    }
}
