const fs = require('fs-extra');
const request = require('request');

const timeout = 2 * 60 * 1000;

/**
 * 下载文件到目标位置
 * @async
 * @param {String} url
 * @param {String} topath
 */
module.exports = async (url, topath, proxy) => {
    let statusCode;
    // let lastTimeRecieved = Date.now()

    const stream = () =>
        new Promise((resolve, reject) => {
            let timeoutTimeout;
            const isTimeout = false;
            let readStream;
            // const setTimeoutTimeout = () => {
            //     try {
            //         clearTimeout(timeoutTimeout)
            //     } catch (e) { }
            //     timeoutTimeout = setTimeout(() => {
            //         console.log('\nTIMEOUT\n')
            //         isTimeout = true
            //         if (readStream && readStream.destroy)
            //             readStream.destroy()
            //         fs.unlinkSync(topath)
            //         createRequest()
            //     }, timeout)
            // }

            const createRequest = () =>
                request({
                    uri: url,
                    method: 'GET',
                    headers: {
                        'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.108 Safari/537.36',
                        'X-Requested-With': 'ShockwaveFlash/28.0.0.161'
                    },
                    proxy,
                    timeout
                })
                    .on('error', function(err) {
                        if (err.code === 'ETIMEDOUT') return createRequest();
                        if (err.code === 'ESOCKETTIMEDOUT')
                            return createRequest();
                        if (err.code === 'ENOENT') return createRequest();
                        // console.log(err.errno, err.code)
                        // console.log(err);
                        reject(new Error(err));
                    })
                    .on('response', function(response) {
                        statusCode = response.statusCode;
                    })
                    // .on('data', () => {
                    //     setTimeoutTimeout()
                    // })
                    .pipe(
                        (readStream = fs
                            .createWriteStream(topath)
                            .on('finish', function() {
                                if (isTimeout) return;
                                clearTimeout(timeoutTimeout);

                                if (statusCode != 200) {
                                    fs.unlinkSync(topath);
                                    readStream.destroy();
                                    return reject(statusCode);
                                }

                                resolve();
                                // if (statusCode != 200 || data['api_name'] == 'なし') {
                                //     skipped = true
                                // }
                            })
                            .on('error', function(err) {
                                if (err.code === 'EPERM') {
                                    readStream.destroy();
                                    return createRequest();
                                }
                                // console.log(err.errno, err.code)
                                console.log('stream error', err);
                                // reject(new Error(err))
                            }))
                    );

            createRequest();
        });

    return await stream();
};
