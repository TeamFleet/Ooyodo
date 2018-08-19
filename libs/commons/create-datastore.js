const path = require('path')
const nedb = require('nedb-promise')

const { pathname } = require('../vars')

const initNedb = (dbnames = []) => {
    const db = {}
    for (let o of dbnames) {
        const dbname = Array.isArray(o) ? o[0] : o
        const filename = Array.isArray(o) ? o[1] : o
        db[dbname] = nedb({
            filename: path.resolve(pathname.repoDatabase, 'db', `${filename}.nedb`),
            autoload: true,
        })
    }
    return db
}

/**
 * 创建数据存储空间（NeDB）
 * @async
 * @returns {Object} datastores
 */
module.exports = async () => {
    return await initNedb([
        'ships',
        ['shipTypes', 'ship_types'],
        ['shipClasses', 'ship_classes'],
        ['shipNamesuffix', 'ship_namesuffix'],
        ['shipSeries', 'ship_series'],

        ['equipments', 'items'],
        ['equipmentTypes', 'item_types'],

        'entities',
        'consumables',

        'exillusts',
        ['exillustTypes', 'exillust_types']
    ])
}
