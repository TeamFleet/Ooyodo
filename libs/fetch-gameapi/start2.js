// const path = require('path')
const url = require('url')
const request = require('request')
// const fs = require('fs-extra')

const { World_17 } = require('../servers')

/**
 * 获取游戏API: api_start2
 * 
 * @async
 * @param {Object} options
 * @param {string} options.token - 访问DMM的token
 * @param {string} [options.ip="http://203.104.209.23"] - DMM服务器IP
 * @param {Object} options.proxy - 代理服务器设置
 * @return {Object} svdata
 */
module.exports = async (options = {}) => {
    const {
        ip = World_17,
        proxy,
    } = options
    const api_token = options.api_token || options.token

    if (!api_token) {
        console.error('未提供 api_token!')
        return
    }

    return await new Promise((resolve, reject) => {
        // const apiPath = `http://${ip}/kcsapi/api_start2` // KC1
        const apiPath = `${ip}kcsapi/api_start2/getData` // KC2

        // const referer = `http://${ip}/kcs/mainD2.swf?api_token=${api_token}&api_starttime=${(new Date()).valueOf()}/[[DYNAMIC]]/1`, // KC1
        const referer = `${ip}kcs2/index.php?api_root=/kcsapi&voice_root=/kcs/sound&osapi_root=osapi.dmm.com&version=4.3.1.0&api_token=${api_token}&api_starttime=${Date.now()}` // KC2

        request({
            uri: url.parse(apiPath),
            method: 'POST',
            headers: {
                'Cache-Control': 'no-cache',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Pragma': 'no-cache',
                'Referer': referer,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36',
            },
            formData: {
                api_token,
                api_verno: 1
            },
            proxy
        }, (err, response, body) => {
            if (err || response.statusCode != 200) {
                console.log(apiPath, err, response, body)
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
                    console.error('数据抓取错误')
                    reject(svdata)
                }
            }
        })
    })
}
