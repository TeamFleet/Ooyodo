const fs = require('fs-extra');
const path = require('path');
const { parseRaw, register } = require('kckit');

const spinner = require('../libs/commons/spinner.cjs');
const { db, pathname } = require('../libs/vars.cjs');

/**
 * 初始化数据库
 * @async
 */
module.exports = async () => {
    const step = '初始化 database';
    const waiting = spinner(step);

    const raw = {};
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
        ['exillustTypes', 'exillust_types'],
    ];

    for (const db of dbs) {
        const type = Array.isArray(db) ? db[0] : db;
        const filename = Array.isArray(db) ? db[1] : db;
        const file = path.resolve(
            pathname.repoDatabase,
            'db',
            `${filename}.nedb`
        );

        raw[type] = await fs.readFile(file, 'utf-8');
    }

    parseRaw(raw, db);
    register({
        db,
    });

    waiting.finish();
};
