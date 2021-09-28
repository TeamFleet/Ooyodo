const download = require('../libs/commons/download.cjs');
const fetchPicsEquipments = require('../libs/fetch-pics/equipments.cjs');

/**
 * 下载装备图片
 * @async
 */
module.exports = async () => {
    await download('下载装备图片', fetchPicsEquipments).catch((err) => {
        console.error(err);
        throw err;
    });
};
