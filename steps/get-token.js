/**
 * 获取 API 访问 Token
 * @async
 * @param {Object} argv
 * @returns {String}
 */
module.exports = async (argv = {}) => {
    if (argv.token)
        return argv.token

    if (Array.isArray(argv._) && argv._.length) {
        let token = argv._[0] + ''
        if (token.substr(0, 6) == 'token=' ||
            token.substr(0, 6) == 'token:')
            token = token.substr(6)
        return token
    }

    return ''
}
