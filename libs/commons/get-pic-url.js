const { World_1: apiOrigin } = require('../servers')
const suffixUtils = require('./suffix-utils')

/**
 * 获取图片资源URL
 * @param {String} 项目类型 
 * @param {String|Number} id 项目ID
 * @param {String} picType 图片类型
 * @param {String|Number} [picVersion] 图片版本号
 * @param {String[]} [extraSegs] 扩展名之前添加的额外字符串
 * @returns {String} 图片URL
 */
module.exports = (itemType, id, picType, picVersion, extraSegs = []) => {
    switch (itemType.toLowerCase()) {
        case 'ships': {
            itemType = 'ship'
            break
        }
        case 'item':
        case 'items':
        case 'equipment':
        case 'equipments': {
            itemType = 'slot'
            break
        }
        default: {
            itemType = itemType.toLowerCase()
        }
    }

    return `${apiOrigin}kcs2/resources/`
        + `${itemType}/${picType}/`
        + `${id}_${suffixUtils.create(id, `${itemType}_${picType}`)}`
        + extraSegs.map(str => `_${str}`).join('')
        + `.png`
        + (picVersion ? `?version=${picVersion}` : '')
}
