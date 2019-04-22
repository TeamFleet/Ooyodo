const fs = require('fs-extra')
const path = require('path')

const spinner = require('../libs/commons/spinner')
const fetchApiStar2 = require('../libs/fetch-gameapi/start2')
const {
    pathname,
    strPaddingLength,
    strPaddingStr,
    proxy: _proxy
} = require('../libs/vars')

/**
 * 获取游戏 API: start2
 * @async
 * @param {*} token 
 * @returns {Object} svdata
 */
module.exports = async (token = '') => {
    let data

    if (token) {
        console.log(`\x1b[32m√\x1b[0m Token: ${token}`)

        const step = '获取游戏API - start2'
        const waiting = spinner(step)

        data = await fetchApiStar2({
            token,
            proxy: _proxy
        }).catch(err => {
            let msg = ''
            if (err && err.message) {
                msg = err.message
            } else if (err.api_result_msg) {
                if (err.api_result) {
                    msg = `[${err.api_result}] ${err.api_result_msg}`
                } else
                    msg = err.api_result_msg
            }
            waiting.fail(step + '\n  ' + msg)
        })

        if (typeof data === 'object') {
            await fs.writeFile(
                path.join(pathname.apiStart2),
                JSON.stringify(data, undefined, 4)
            )
            waiting.finish()
        } else {
            data = {}
        }
    }

    // 检查api_start2.json
    if (!fs.existsSync(pathname.apiStart2)) {
        console.log('❌  终止! '.padEnd(strPaddingLength, strPaddingStr))
        console.log('')

        if (!token) {
            console.log('请输入正确的命令')
            console.log('npm start -- [token]')
        } else {
            console.log('获取 api_start2 发生错误!')
        }

        console.log('')
        console.log(''.padEnd(strPaddingLength, strPaddingStr))
    }

    return data
}
