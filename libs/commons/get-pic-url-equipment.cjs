const getPicUrl = require('./get-pic-url.cjs');
const zeroPadding = require('./zero-padding.cjs');

/**
 * 获取装备图片资源URL
 * @param {String|Number} equipmentId 装备ID
 * @param {String} picType 图片类型
 * @param {String|Number} [picVersion] 图片版本号
 * @returns {String} 图片URL
 */
module.exports = (equipmentId, picType, picVersion) =>
    getPicUrl('equipment', zeroPadding(equipmentId, 3), picType, picVersion);

/*
可用图片类型
[
    'card',
    'card_t',
    'item_on',
    'item_character',
    'item_up',
    'statustop_item',
]
*/
