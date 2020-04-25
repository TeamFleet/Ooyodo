const path = require('path');
const fs = require('fs-extra');
// const md5File = require('md5-file');

const { enemyIdStartFrom, pathname, proxy: _proxy } = require('../vars');
const batch = require('./batch');

const getPicUrlShip = require('../commons/get-pic-url-ship');
const fetchFile = require('../commons/fetch-file');
const wait = require('../commons/wait');

const dirPicsShips = pathname.fetched.pics.ships;
const dirPicsShipsExtra = pathname.fetched.pics.shipsExtra;
const dirPicsEnemies = pathname.fetched.pics.enemies;
const fileApiStart2 = pathname.apiStart2;
const filePicsVersions = pathname.fetched.versions.ships;

const imgTypes = [
    'full',
    'full_dmg',
    // 'supply_character',
    // 'supply_character_dmg',
    'remodel',
    'remodel_dmg',
    'banner',
    'banner_dmg',
    'card',
    'card_dmg',
    'special',
];
// const imgTypesHoliday = [
//     'full',
//     'full_dmg'
// ]
const imgTypesEnemy = [
    'full',
    // 'full_dmg',
    'banner',
    // 'banner_dmg',
];
const typeFileName = {
    banner: 0,
    banner_dmg: 1,
    card: 2,
    card_dmg: 3,
    full: 8,
    full_dmg: 9,
    remodel: 10,
    remodel_dmg: 11,
};

// http://203.104.209.23/kcs2/resources/ship/full/0406_6059.png?version=2

/*
fetched_data
`-- pics
    `-- ships
        +-- versions.json
        +-- raw
        `-- extract
*/

/**
 * 获取舰娘图片资源
 *
 * @param {onProgressCallback} onProgress - 每下载一个舰娘的图片后会执行的回调函数
 * @param {Object} proxy - 代理服务器设置
 * @return {promise}
 */
/**
 * 每下载一个舰娘的图片后会执行的回调函数
 * @callback onProgressCallback
 * @param {Object} obj
 * @param {Object} obj.ship - 当前完成的舰娘的元数据
 * @param {number} obj.index - 当前完成的index
 * @param {number} obj.length - 有效总数
 */
module.exports = async (onProgress, proxy = _proxy) => {
    await fs.ensureDir(dirPicsShips);
    await fs.ensureDir(dirPicsShipsExtra);
    await fs.ensureDir(dirPicsEnemies);

    if (!fs.existsSync(fileApiStart2)) throw new Error('api_start2 不存在');

    if (!fs.existsSync(filePicsVersions))
        await fs.writeJson(filePicsVersions, {}, { spaces: 4 });

    const ships = {}; // 舰娘元数据
    const map = {}; // 舰娘和加密ID的对应
    const picsVersions = await fs.readJSON(filePicsVersions); // 已存在的舰娘图片版本
    const needUpdate = []; // 需要更新的舰娘
    const picsVersionsNew = {}; // 更新后的舰娘图片版本
    const downloadList = []; // 下载URL列表
    const apiStart2 = await fs.readJSON(fileApiStart2);
    const linksBroken = [];

    if (
        typeof apiStart2 !== 'object' ||
        typeof apiStart2.api_data !== 'object' ||
        typeof apiStart2.api_data.api_mst_ship !== 'object' ||
        typeof apiStart2.api_data.api_mst_shipgraph !== 'object'
    ) {
        throw new Error('api_start2.json 已损坏，请提供 token 以重新下载');
    }

    const {
        api_data: { api_mst_ship: rawShips, api_mst_shipgraph: shipgraph },
    } = apiStart2;

    /* data examples

        ship: {
            "api_id": 1,
            "api_sortno": 31,
            "api_name": "睦月",
            "api_yomi": "むつき",
            "api_stype": 2,
            "api_ctype": 28,
            "api_afterlv": 20,
            "api_aftershipid": "254",
            "api_taik": [
            13,
            24
            ],
            "api_souk": [
            5,
            18
            ],
            "api_houg": [
            6,
            29
            ],
            "api_raig": [
            18,
            59
            ],
            "api_tyku": [
            7,
            29
            ],
            "api_luck": [
            12,
            49
            ],
            "api_soku": 10,
            "api_leng": 1,
            "api_slot_num": 2,
            "api_maxeq": [
            0,
            0,
            0,
            0,
            0
            ],
            "api_buildtime": 18,
            "api_broken": [
            1,
            1,
            4,
            0
            ],
            "api_powup": [
            1,
            1,
            0,
            0
            ],
            "api_backs": 3,
            "api_getmes": "睦月です。<br>はりきって、まいりましょー！",
            "api_afterfuel": 100,
            "api_afterbull": 100,
            "api_fuel_max": 15,
            "api_bull_max": 15,
            "api_voicef": 0
        }

        shipgraph: {
            "api_id": 1,
            "api_sortno": 31,
            "api_filename": "snohitatusbk",
            "api_version": [
            "21",
            "19",
            "1"
            ],
            "api_boko_n": [
            125,
            24
            ],
            "api_boko_d": [
            83,
            25
            ],
            "api_kaisyu_n": [
            28,
            7
            ],
            "api_kaisyu_d": [
            28,
            7
            ],
            "api_kaizo_n": [
            70,
            -31
            ],
            "api_kaizo_d": [
            29,
            -32
            ],
            "api_map_n": [
            29,
            24
            ],
            "api_map_d": [
            -13,
            15
            ],
            "api_ensyuf_n": [
            129,
            18
            ],
            "api_ensyuf_d": [
            -3,
            -32
            ],
            "api_ensyue_n": [
            129,
            0
            ],
            "api_battle_n": [
            73,
            27
            ],
            "api_battle_d": [
            29,
            21
            ],
            "api_weda": [
            112,
            108
            ],
            "api_wedb": [
            145,
            153
            ]
        }
     */

    // 确定舰娘图片的加密ID对应
    for (const i in rawShips) {
        if (rawShips[i].api_name !== 'なし') {
            ships[rawShips[i].api_id] = rawShips[i];
            map[rawShips[i].api_id] = null;
            // shipsCount++
        }
    }

    // 确定当前图片版本
    for (const i in shipgraph) {
        const o = shipgraph[i];
        const id = o.api_id;
        // console.log(id, o.api_filename)
        if (typeof map[id] !== 'undefined') {
            map[id] = o.api_filename;

            let curPicVersion;
            if (Array.isArray(o.api_version)) {
                // curPicVersion = o.api_version
                //     .map(value => parseInt(value))
                //     .reduce((accumulator, currentValue) => accumulator + currentValue)
                curPicVersion = parseInt(o.api_version[0]);
            } else curPicVersion = parseInt(o.api_version);

            if (curPicVersion !== picsVersions[id]) needUpdate.push(id);

            // 更新图片版本
            picsVersionsNew[id] = curPicVersion;
        }
    }

    for (const id of needUpdate) {
        const isEnemy = id >= enemyIdStartFrom;
        const ship = ships[id];
        const name =
            ship.api_name +
            (isEnemy && ship.api_yomi !== '-' ? ship.api_yomi || '' : '');
        const types = isEnemy ? imgTypesEnemy : imgTypes;
        const pathThisShip = path.join(
            isEnemy ? dirPicsEnemies : dirPicsShips,
            `${id}`
        );

        await fs.ensureDir(pathThisShip);

        for (const type of types) {
            const url = getPicUrlShip(id, type, picsVersionsNew[id], [map[id]]);
            const pathname = path.join(
                pathThisShip,
                `${type in typeFileName ? typeFileName[type] : type}.png`
            );
            const retryForNoTrail = async () => {
                const urlNoTrail = getPicUrlShip(id, type, picsVersionsNew[id]);
                await wait(1 * 1000);
                await fetchFile(urlNoTrail, pathname).catch(() => {
                    if (type !== 'special') {
                        linksBroken.push(url);
                        linksBroken.push(urlNoTrail);
                    }
                });
            };
            downloadList.push({
                id,
                name,
                ship,
                type,
                url,
                pathname,
                version: picsVersionsNew[id],
                on403: retryForNoTrail,
                on404: retryForNoTrail,
            });
        }

        // 友方舰娘额外图片
        // if (!isEnemy) {
        //     for (let type of imgTypes) {
        //         const dir = path.resolve(dirPicsShipsExtra, `_${id}`)
        //         const picId = type in typeFileName ? typeFileName[type] : type

        //         const dirOriginal = path.resolve(dirPicsShips, `${id}`)
        //         const fileOriginal = path.resolve(dirOriginal, `${picId}.png`)
        //         const fileExtra = path.resolve(dir, `${picId}.png`)

        //         await fs.ensureDir(dir)

        //         downloadList.push({
        //             id, name, ship,
        //             type,
        //             url: getPicUrlShip(id, type, picsVersionsNew[id], [map[id]]),
        //             pathname: fileExtra,
        //             version: picsVersionsNew[id],
        //             ignore404: true,
        //             // onFail: async () => {
        //             //     await fs.remove(dir)
        //             // },
        //             onFetch: () => {
        //                 // 如果原始版本文件不存在，移动到原始版本目录
        //                 if (!fs.existsSync(fileOriginal)) {
        //                     fs.moveSync(fileExtra, fileOriginal)
        //                     return
        //                 }
        //                 // 该文件下载完成后，对比标准图片，如果相同，删除
        //                 const md5Original = md5File.sync(fileOriginal)
        //                 const md5This = md5File.sync(fileExtra)
        //                 if (md5Original === md5This)
        //                     fs.removeSync(fileExtra)
        //             }
        //         })
        //     }
        // }
    }

    await batch(downloadList, onProgress, filePicsVersions, proxy);

    // 检查 extra 目录下的每个文件夹，如果发现有空目录，清除
    {
        const dirs = (await fs.readdir(dirPicsShipsExtra))
            .map((filename) => path.resolve(dirPicsShipsExtra, filename))
            .filter((pathname) => fs.lstatSync(pathname).isDirectory())
            .filter((pathname) => !fs.readdirSync(pathname).length);
        for (const dir of dirs) {
            // console.log(dir)
            await fs.remove(dir);
        }
    }

    for (const link of linksBroken) {
        console.error(link);
    }
};
