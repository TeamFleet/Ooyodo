/**
 * 获取 API 访问 Token
 * @async
 * @param {Object} argv
 * @returns {String}
 */
module.exports = async (args = {}) => {
    if (args.token)
        return args.token

    if (Array.isArray(args) && args.length) {
        let token = args[0] + ''
        if (token.substr(0, 6) == 'token=' ||
            token.substr(0, 6) == 'token:')
            token = token.substr(6)
        return token
    }

    return ''
}
