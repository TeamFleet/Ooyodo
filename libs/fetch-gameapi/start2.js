// const path = require('path')
const url = require('url')
const request = require('request')
// const fs = require('fs-extra')

/**
 * 获取游戏API: api_start2
 * 
 * @param {Object} options
 * @param {string} options.token - 访问DMM的token
 * @param {string} [options.ip="203.104.209.23"] - DMM服务器IP
 * @param {Object} options.proxy - 代理服务器设置
 * @return {promise}
 */
const run = (options) =>
    new Promise((resolve, reject) => {
        const {
            api_token: _api_token,
            token: _token,
            ip = "203.104.209.23",
            proxy,
        } = options
        const api_token = _api_token || _token

        if (!api_token)
            return reject('未提供 api_token!')

        new Promise((resolve, reject) => {
            request({
                uri: url.parse(`http://${ip}/kcsapi/api_start2`),
                method: 'POST',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Pragma': 'no-cache',
                    'Referer': `http://${ip}/kcs/mainD2.swf?api_token=${api_token}&api_starttime=${(new Date()).valueOf()}/[[DYNAMIC]]/1`,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.115 Safari/537.36',
                    'X-Requested-With': 'ShockwaveFlash/17.0.0.169'
                },
                formData: {
                    api_token,
                    api_verno: 1
                },
                proxy
            }, (err, response, body) => {
                if (err || response.statusCode != 200) {
                    // console.log(err, response)
                    reject(new Error(err))
                }
                if (!err && response.statusCode == 200) {
                    // console.log(body)
                    let svdata
                    eval(body)
                    // console.log(svdata)
                    if (svdata.api_result == 1) {
                        resolve(svdata)
                    } else {
                        // console.log(svdata)
                        reject(svdata)
                    }
                }
            })
        })
            .then(svdata => resolve(svdata))
            .catch(err => reject(err))
    })

module.exports = run