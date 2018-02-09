const fs = require('fs-extra')
const path = require('path')
const { parseRaw, register } = require('kckit')

const {
    db,
    pathname,
} = require('../vars')

module.exports = async () => new Promise(async (resolve, reject) => {
    let raw = {}
    const dbs = [
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
    ]

    for (let db of dbs) {
        const type = Array.isArray(db) ? db[0] : db
        const filename = Array.isArray(db) ? db[1] : db

        raw[type] = await new Promise((resolve, reject) => {
            fs.readFile(
                path.resolve(pathname.repoDatabase, './db', `${filename}.nedb`),
                'utf-8',
                (err, data) => {
                    if (err)
                        return reject(err)
                    resolve(data)
                }
            )
        }).catch(err => reject(err))
    }

    parseRaw(raw, db)
    register({
        db
    })

    resolve(db)
})