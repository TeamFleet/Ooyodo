const getPicUrl = require('./get-pic-url')
const zeroPadding = require('./zero-padding')

/**
 * 获取舰娘图片资源URL
 * @param {String|Number} shipId 舰娘ID
 * @param {String} picType 图片类型
 * @param {String|Number} [picVersion] 图片版本号
 * @returns {String} 图片URL
 */
module.exports = (shipId, picType, picVersion) =>
    getPicUrl('ship', zeroPadding(shipId, 4), picType, picVersion)

/*
可用图片类型
[
    'full',
    'full_dmg',
    'supply_character',
    'supply_character_dmg',
    'remodel',
    'remodel_dmg',
    'banner',
    'banner_dmg',
    'card',
    'card_dmg',
]
*/
