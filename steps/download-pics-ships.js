const download = require('../libs/commons/download')
const fetchPicsShips = require('../libs/fetch-pics/ships')

/**
 * 下载舰娘图片
 * @async
 */
module.exports = async () => {
    await download('下载舰娘图片', fetchPicsShips)
        .catch(err => {
            console.error(err)
            throw err
        })
}
