const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const decamelize = require('decamelize');
const md5File = require('md5-file/promise');
const glob = require('glob-promise');

const createDatastore = require('../libs/commons/create-datastore');
const spinner = require('../libs/commons/spinner');
const {
    pathname: { repoPics }
} = require('../libs/vars');
const Clpr = require('../libs/clpr');

const dest = path.resolve(__dirname, '../.dist/hash');
let db;
let filesCount = 0;

// ============================================================================

const main = async () => {
    console.log(chalk.magentaBright.underline(`复制图片 (Hash 文件名)`) + '\n');

    await fs.ensureDir(dest);
    db = await createDatastore();

    await exportPics('entities');
    await exportPics('equipments');
    await exportPics('ships');
    await exportPics('shipsExtra');

    console.log(chalk.magentaBright('发布'));
    spinner(`总计 ${filesCount} 个文件`).succeed();
    // TODO 操作 database repo
    // TODO 操作 Akigumo repi
};

module.exports = main;

// ============================================================================

const exportPics = async type => {
    const types = {
        ships: {
            title: '舰娘',
            getList: getListShips
        },
        shipsExtra: {
            title: '舰娘限定图鉴',
            getList: getListShipExtra
        },
        equipments: {
            title: '装备',
            getList: async () => await getListFromFolder('equipments', ['card'])
        },
        entities: {
            title: '声优 & 画师',
            getList: async () =>
                await getListFromFolder('entities', [0, '0-1', '0-2', 2])
        }
    };

    console.log(chalk.magentaBright(types[type].title));

    const waitingGlob = spinner('确认文件列表');
    const list = await types[type].getList();
    const map = {};
    const files = [];
    const parseList = async (list, map) => {
        for (const [id, value] of Object.entries(list)) {
            if (typeof map[id] !== 'object') map[id] = {};
            if (typeof value === 'object') {
                await parseList(value, map[id]);
            } else {
                const md5 = await md5File(value);
                const ext = path.extname(value);
                const md5Splitted = [md5.slice(0, 2), md5.slice(2)].join('/');
                const newfile = path.resolve(dest, md5Splitted + ext);
                map[id] = md5Splitted;
                files.push([value, newfile]);
            }
        }
    };
    await parseList(list, map);
    waitingGlob.succeed();

    const progress = new Clpr({
        name: '复制文件',
        promises: files.map(([file, newfile]) => async () => {
            await fs.ensureDir(path.dirname(newfile));
            await fs.copyFile(file, newfile);
        })
    });
    await progress.start();

    const waitingWriteMap = spinner('写入对照表文件');
    filesCount += files.length;
    const fileMap = path.resolve(dest, `map_${decamelize(type, '_')}.json`);
    await fs.remove(fileMap);
    await fs.writeJson(fileMap, map);
    // await fs.writeJson(
    //     path.resolve(dest, `list_${decamelize(type, '_')}.json`),
    //     list,
    //     {
    //         spaces: 4
    //     }
    // );
    waitingWriteMap.succeed();
};

const getListFromFolder = async (foldername, filenames) => {
    const list = {};
    const globPattern = path.resolve(
        repoPics,
        'dist',
        foldername,
        '**',
        `@(${filenames
            .map(f => `${f}.png`)
            .concat(filenames.map(f => `${f}.jpg`))
            .join('|')})`
    );
    const files = await glob(globPattern);
    for (const file of files) {
        const id = parseInt(path.basename(path.dirname(file)));
        const fileId = path.parse(file).name;
        if (typeof list[id] !== 'object') list[id] = {};
        list[id][fileId] = file;
    }
    return list;
};

const getListShips = async () => {
    const list = {};
    const filenames = [
        0,
        '0-1',
        '0-2',
        1,
        '1-1',
        '1-2',
        2,
        3,
        8,
        9,
        10,
        11,
        'special'
    ];
    const srcDist = path.resolve(repoPics, 'dist', 'ships');
    const ships = (await db.ships.find({})).reduce((o, ship) => {
        o[parseInt(ship.id)] = ship;
        return o;
    }, {});
    const getPrevModel = ship =>
        typeof ship.remodel === 'object' &&
        typeof ship.remodel.prev === 'number' &&
        typeof ships[ship.remodel.prev] === 'object' &&
        ship.id !== ship.remodel.prev
            ? ships[ship.remodel.prev]
            : undefined;

    for (const ship of Object.values(ships)) {
        list[ship.id] = filenames.reduce((l, basename) => {
            const filename = `${basename}.png`;
            let file = path.resolve(srcDist, `${ship.id}`, filename);
            let prevModel = getPrevModel(ship);
            while (!fs.existsSync(file) && prevModel) {
                file = path.resolve(srcDist, `${prevModel.id}`, filename);
                prevModel = getPrevModel(prevModel);
            }
            if (fs.existsSync(file)) l[basename] = file;
            return l;
        }, {});
    }

    return list;
};

const getListShipExtra = async () => {
    const list = {};
    const filenames = [8, 9];
    const srcDist = path.resolve(repoPics, 'dist', 'ships-extra');
    const ids = (await fs.readdir(srcDist))
        .filter(filename =>
            fs.lstatSync(path.resolve(srcDist, filename)).isDirectory()
        )
        .map(filename => parseInt(filename));

    for (const id of ids) {
        const folder = path.resolve(srcDist, `${id}`);
        list[id] = {};
        for (const basename of filenames) {
            const filename = `${basename}.png`;
            let file = path.resolve(folder, filename);
            if (!fs.existsSync(file)) {
                // illust_extra
                const result = await db.ships.find({
                    illust_extra: {
                        $elemMatch: id
                    }
                });
                if (result.length)
                    file = path.resolve(
                        repoPics,
                        'dist',
                        'ships',
                        `${result[0].id}`,
                        `${basename}.png`
                    );
            }
            if (fs.existsSync(file)) list[id][basename] = file;
        }
    }

    return list;
};
