const path = require('path')
const spinners = require('cli-spinners')

module.exports = {
    db: {},

    spinner: spinners.dots,

    enemyIdStartFrom: 1501,
    enemyEquipmentIdStartFrom: 501,

    pathname: {
        fetchedData: path.resolve(process.cwd(), './.fetched_data'),
        fetched: {
            pics: {
                ships: path.resolve(process.cwd(), './.fetched_data/pics/ships'),
                equipments: path.resolve(process.cwd(), './.fetched_data/pics/equipments'),
            }
        },

        repoPics: path.resolve(process.cwd(), './.repo_pics'),
        repoDatabase: path.resolve(process.cwd(), './.repo_database'),

        apiStart2: path.resolve(process.cwd(), './.fetched_data/api_start2.json')
    },
}