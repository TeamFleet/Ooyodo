const fs = require('fs-extra');
const path = require('path');
const spinners = require('cli-spinners');
const {
    enemyIdStartFrom,
    // enemyEquipmentIdStartFrom
} = require('kckit');

module.exports = {
    // proxy: 'http://127.0.0.1:10807',
    proxy: undefined,

    gameVersion: '4.5.4.1',

    db: {},

    spinner: spinners.dots,

    enemyIdStartFrom,
    enemyEquipmentIdStartFrom: 600,

    pathname: {
        fetchedData: path.resolve(process.cwd(), './.fetched_data'),
        fetched: {
            pics: {
                ships: path.resolve(
                    process.cwd(),
                    './.fetched_data/pics/ships'
                ),
                shipsExtra: path.resolve(
                    process.cwd(),
                    './.fetched_data/pics/ships-extra'
                ),
                enemies: path.resolve(
                    process.cwd(),
                    './.fetched_data/pics/enemies'
                ),
                equipments: path.resolve(
                    process.cwd(),
                    './.fetched_data/pics/equipments'
                ),
            },
            versions: {
                ships: path.resolve(
                    process.cwd(),
                    './.fetched_data/pics/ships_versions.json'
                ),
                equipments: path.resolve(
                    process.cwd(),
                    './.fetched_data/pics/equipments_versions.json'
                ),
            },
        },

        repoPics: path.resolve(process.cwd(), './.repo_pics'),
        repoDatabase: (() => {
            const pathFromParentFolder = path.resolve(
                __dirname,
                '../../database'
            );
            if (fs.existsSync(pathFromParentFolder))
                return pathFromParentFolder;
            return path.resolve(process.cwd(), './.repo_database');
        })(),
        repoAkigumo: (() => {
            const pathFromParentFolder = path.resolve(
                __dirname,
                '../../Akigumo'
            );
            if (fs.existsSync(pathFromParentFolder))
                return pathFromParentFolder;
            path.resolve(process.cwd(), './.repo_akigumo');
        })(),

        newPics: path.resolve(process.cwd(), './.new_pics'),

        apiStart2: path.resolve(
            process.cwd(),
            './.fetched_data/api_start2.json'
        ),
    },

    strPaddingLength: 50,
    strPaddingStr: '─',
};
