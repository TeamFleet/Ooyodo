const path = require('path')
const spinners = require('cli-spinners')

module.exports = {
    spinner: spinners.dots,

    enemyIdStartFrom: 1501,
    enemyEquipmentIdStartFrom: 501,

    pathname: {
        fetchedData: path.resolve(process.cwd(), './.fetched_data'),
        repoPics: path.resolve(process.cwd(), './.repo_pics'),
        repoDatabase: path.resolve(process.cwd(), './.repo_database'),

        apiStart2: path.resolve(process.cwd(), './.fetched_data/api_start2.json')
    },
}