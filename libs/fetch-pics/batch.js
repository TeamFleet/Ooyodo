const fs = require('fs-extra')
const url = require('url')

const fetchFile = require('../commons/fetch-file')

module.exports = async (
    downloadList = [],
    onProgress,
    pathnamePicVersions,
    proxy
) => {
    let lastId
    let completeIndex = 0

    for (let o of downloadList) {
        let complete = true

        await fetchFile(
            url.parse(o.url),
            o.pathname,
            proxy
        )
            .catch(err => {
                complete = false
                // console.log(err)
                // return reject(err)
                // reject(err)
                // console.log("  │       Fetched error: ", err)
            })

        if (!complete) {
            const versions = await fs.readJson(pathnamePicVersions)
            versions[o.id] = -1
            await fs.writeJson(pathnamePicVersions, versions)
        }

        if (lastId !== o.id) {
            const versions = await fs.readJson(pathnamePicVersions)
            if (versions[o.id] == -1) {
                delete versions[o.id]
            } else {
                versions[o.id] = o.version
            }
            await fs.writeJson(pathnamePicVersions, versions)
            lastId = o.id
        }

        if (typeof onProgress === 'function')
            onProgress({
                index: completeIndex,
                length: downloadList.length,
                complete: complete,
                url,
                id: o.id,
                name: o.name,
            })

        completeIndex++
    }
}
