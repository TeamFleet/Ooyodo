const fs = require('fs-extra')
const path = require('path')

/**
 * 移除所有子目录
 * @async
 * @param {String} dir 
 * @void
 */
const removeSubfolders = async (dir) => {
    if (typeof dir !== 'string') return
    if (!fs.existsSync(dir)) return

    const files = await fs.readdir(dir)
    const subfolders = files
        .map(filename => path.resolve(dir, filename))
        .filter(file => {
            const lstat = fs.lstatSync(file)
            return lstat.isDirectory()
        })

    for (const folder of subfolders) {
        await fs.remove(folder)
    }

}

module.exports = removeSubfolders
