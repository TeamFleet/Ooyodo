const download = require('../libs/commons/download.cjs');
const fetchPicsShips = require('../libs/fetch-pics/ships.cjs');

/**
 * 下载舰娘图片
 * @async
 */
module.exports = async () => {
    await download('下载舰娘图片', fetchPicsShips).catch((err) => {
        console.error(err);
        throw err;
    });
};
