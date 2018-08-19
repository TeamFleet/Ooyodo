const path = require('path')
const spinners = require('cli-spinners')
const {
    enemyIdStartFrom,
    // enemyEquipmentIdStartFrom
} = require('kckit')

module.exports = {
    db: {},

    spinner: spinners.dots,

    enemyIdStartFrom,
    enemyEquipmentIdStartFrom: 500,

    pathname: {
        fetchedData: path.resolve(process.cwd(), './.fetched_data'),
        fetched: {
            pics: {
                ships: path.resolve(process.cwd(), './.fetched_data/pics/ships'),
                enemies: path.resolve(process.cwd(), './.fetched_data/pics/enemies'),
                equipments: path.resolve(process.cwd(), './.fetched_data/pics/equipments'),
            },
            versions: {
                ships: path.resolve(process.cwd(), './.fetched_data/pics/ships_versions.json'),
                equipments: path.resolve(process.cwd(), './.fetched_data/pics/equipments_versions.json'),
            }
        },

        repoPics: path.resolve(process.cwd(), './.repo_pics'),
        repoDatabase: path.resolve(process.cwd(), './.repo_database'),

        newPics: path.resolve(process.cwd(), './.new_pics'),

        apiStart2: path.resolve(process.cwd(), './.fetched_data/api_start2.json')
    },

    strPaddingLength: 50,
    strPaddingStr: '─'
}
