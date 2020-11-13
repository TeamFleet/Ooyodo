const path = require('path');
const fs = require('fs-extra');

const { enemyEquipmentIdStartFrom, pathname } = require('../vars');
const batch = require('./batch');

const getPicUrlEquipment = require('../commons/get-pic-url-equipment');

const dirPicsEquipments = pathname.fetched.pics.equipments;
const fileApiStart2 = pathname.apiStart2;
const filePicsVersions = pathname.fetched.versions.equipments;

const imgTypes = [
    'card',
    'item_on',
    'item_character',
    'item_up',
    'statustop_item',
];
/*
fetched_data
`-- pics
    `-- equipments
        +-- 1
            +-- card.png
            +-- item_character.png
            +-- item_on.png
            +-- item_up.png
            `-- statustop_item.png
        +-- 2
        `-- ...id
*/

/**
 * 获取装备图片资源
 *
 * @param {onProgressCallback} onProgress - 每下载一个舰娘的图片后会执行的回调函数
 * @param {Object} proxy - 代理服务器设置
 * @return {promise}
 */
/**
 * 每下载一个舰娘的图片后会执行的回调函数
 * @callback onProgressCallback
 * @param {Object} obj
 * @param {Object} obj.equipment - 当前完成的装备的元数据
 * @param {number} obj.index - 当前完成的index
 * @param {number} obj.length - 有效总数
 */
module.exports = async (onProgress, proxy) => {
    await fs.ensureDir(dirPicsEquipments);

    if (!fs.existsSync(fileApiStart2)) throw new Error('api_start2 不存在');

    if (!fs.existsSync(filePicsVersions))
        await fs.writeJson(filePicsVersions, {});

    const picsVersions = await fs.readJSON(filePicsVersions); // 已存在的舰娘图片版本
    const picsVersionsNew = {}; // 更新后的舰娘图片版本
    const downloadList = []; // 下载URL列表
    const apiStart2 = await fs.readJSON(fileApiStart2);

    if (
        typeof apiStart2 !== 'object' ||
        typeof apiStart2.api_data !== 'object' ||
        typeof apiStart2.api_data.api_mst_slotitem !== 'object'
    ) {
        throw new Error('api_start2.json 已损坏，请提供 token 以重新下载');
    }

    const {
        api_data: { api_mst_slotitem: slotitem },
    } = apiStart2;

    const equipments = slotitem.filter((obj) => {
        const id = parseInt(obj.api_id);
        if (id >= enemyEquipmentIdStartFrom) return false;

        const version = parseInt(obj.api_version || 1);
        if (version == picsVersions[id]) return false;

        picsVersionsNew[id] = version;
        return true;
    });

    for (const obj of equipments) {
        const id = parseInt(obj.api_id);
        const name = obj.api_name;
        const pathThisEquipment = path.join(dirPicsEquipments, '' + id);
        const picVsersion = obj.api_version || undefined;

        if (fs.existsSync(pathThisEquipment))
            await fs.remove(pathThisEquipment);
        await fs.ensureDir(pathThisEquipment);

        for (const type of imgTypes) {
            const url = getPicUrlEquipment(id, type, picVsersion);
            const pathname = path.join(pathThisEquipment, `${type}.png`);
            // let complete = true
            downloadList.push({
                id,
                name,
                equipment: obj,
                type,
                url,
                pathname,
                version: picsVersionsNew[id],
            });
        }
    }

    await batch(downloadList, onProgress, filePicsVersions, proxy);
};
