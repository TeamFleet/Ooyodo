const path = require('path')

module.exports = {
    pathname: {
        fetchedData: path.resolve(__dirname, '../.fetched_data'),
        repoPics: path.resolve(__dirname, '../.repo_pics'),
        repoDatabase: path.resolve(__dirname, '../.repo_database'),

        apiStart2: path.resolve(__dirname, '../.fetched_data/api_start2.json')
    }
}