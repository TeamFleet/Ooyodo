const fs = require('fs-extra')
const url = require('url')

const fetchFile = require('../commons/fetch-file')

module.exports = async (
    downloadList = [],
    onProgress,
    pathnamePicVersions,
    proxy
) => {

    if (!Array.isArray(downloadList))
        return

    if (!downloadList.length)
        return

    /** @type {*} 上一项的 ID / 特征值 */
    let lastId = downloadList[0].id
    const status = {}
    const versions = {}

    /** @type {Number} 当前已运行到的项目的 index */
    let completeIndex = 0

    const updateVersionFile = async (id = lastId) => {
        // 更新版本记录文件
        const v = await fs.readJson(pathnamePicVersions)
        if (v[id] === -1) {
            delete v[id]
        } else if (status[id] && versions[id]) {
            v[id] = versions[id]
        }
        // console.log('updateVersionFile', id, status[id], versions[id], v)
        await fs.writeJson(pathnamePicVersions, v)
    }

    for (let o of downloadList) {

        const {
            url: _url,
            pathname: saveTo,
            id, name, version,
            ignore404 = false,
            onFetch = () => { },
            onFail = () => { },
        } = o

        status[id] = true
        versions[id] = version || 1

        await fetchFile(
            url.parse(_url),
            saveTo,
            proxy
        )
            .then(onFetch)
            .catch(async err => {
                if (err == 404) return
                console.log(_url, err)
                status[id] = false
                await onFail(err)
                // return reject(err)
                // reject(err)
                // console.log("  │       Fetched error: ", err)
            })

        if (!status[id]) {
            const versions = await fs.readJson(pathnamePicVersions)
            versions[id] = -1
            await fs.writeJson(pathnamePicVersions, versions)
        }

        // 当前项和上一项 ID 不同时
        // console.log(lastId, id)
        if (lastId !== id) {
            await updateVersionFile(lastId)
            lastId = id
        }

        if (typeof onProgress === 'function')
            onProgress({
                index: completeIndex,
                length: downloadList.length,
                complete: status[id],
                url: _url,
                id: id,
                name: name,
            })

        completeIndex++
    }

    await updateVersionFile(lastId)
}
