const fs = require('fs-extra')
const url = require('url')

const fetchFile = require('../commons/fetch-file')

module.exports = async (
    downloadList = [],
    onProgress,
    pathnamePicVersions,
    proxy
) => {

    /** @type {*} 上一项的 ID / 特征值 */
    let lastId

    /** @type {Number} 当前已运行到的项目的 index */
    let completeIndex = 0

    for (let o of downloadList) {

        /** @type {Boolean} 当前下载是否完成 */
        let complete = true

        const {
            url: _url,
            pathname: saveTo,
            id, name, version,
            ignore404 = false,
            onFetch = () => { },
            onFail = () => { },
        } = o

        await fetchFile(
            url.parse(_url),
            saveTo,
            proxy
        )
            .then(onFetch)
            .catch(async err => {
                if (err != 404) complete = false
                await onFail(err)
                // return reject(err)
                // reject(err)
                // console.log("  │       Fetched error: ", err)
            })

        if (!complete) {
            const versions = await fs.readJson(pathnamePicVersions)
            versions[id] = -1
            await fs.writeJson(pathnamePicVersions, versions)
        }

        // 当前项和上一项 ID 不同时
        if (lastId !== id) {
            // 更新版本记录文件
            const versions = await fs.readJson(pathnamePicVersions)
            if (versions[id] == -1) {
                delete versions[id]
            } else {
                versions[id] = version
            }
            await fs.writeJson(pathnamePicVersions, versions)
            lastId = id
        }

        if (typeof onProgress === 'function')
            onProgress({
                index: completeIndex,
                length: downloadList.length,
                complete: complete,
                url: _url,
                id: id,
                name: name,
            })

        completeIndex++
    }
}
