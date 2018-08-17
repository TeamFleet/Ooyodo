const fs = require('fs-extra')
const request = require('request')

module.exports = async (url, topath, proxy) => {
    let statusCode
    return await new Promise((resolve, reject) => {
        request({
            'uri': url,
            'method': 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.108 Safari/537.36',
                'X-Requested-With': 'ShockwaveFlash/28.0.0.161',
            },
            'proxy': proxy
        }).on('error', function (err) {
            reject(new Error(err))
        }).on('response', function (response) {
            statusCode = response.statusCode
        }).pipe(
            fs.createWriteStream(topath)
                .on('finish', function () {
                    if (statusCode != 200) {
                        fs.unlinkSync(topath)
                        reject(statusCode)
                    }
                    resolve()
                    // if (statusCode != 200 || data['api_name'] == 'なし') {
                    //     skipped = true
                    // }
                })
        )
    })
}
