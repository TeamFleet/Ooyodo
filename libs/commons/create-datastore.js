const path = require('path');
// const Datastore = require('nedb')
const nedbPromise = require('nedb-promise');

const { pathname } = require('../vars');

const initNedb = (dbnames = []) => {
    const db = {};
    for (const o of dbnames) {
        const dbname = Array.isArray(o) ? o[0] : o;
        const filename = Array.isArray(o) ? o[1] : o;
        // const store = Datastore({
        //     filename: path.resolve(pathname.repoDatabase, 'db', `${filename}.nedb`),
        //     autoload: true,
        // })
        // const db = nedbPromise.fromInstance(store)
        // db.persistence = store.persistence
        // db[dbname] = db
        db[dbname] = nedbPromise({
            filename: path.resolve(
                pathname.repoDatabase,
                'db',
                `${filename}.nedb`
            ),
            autoload: true
        });
    }
    return db;
};

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
    ]);
};
