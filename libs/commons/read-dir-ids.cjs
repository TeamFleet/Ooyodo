const fs = require('fs-extra')
const path = require('path')

/**
 * 从目标目录获取 ID 文件夹列表
 * @async
 * @param {String} dir
 * @returns {Array}
 */
module.exports = async (dir, checkId = () => true) => {
    const files = await fs.readdir(dir)
    return files
        .filter(filename => fs.lstatSync(path.resolve(dir, filename)).isDirectory())
        .map(filename => {
            if (isNaN) return filename
            return parseInt(filename)
        })
        .filter(checkId)
        .sort()
}
