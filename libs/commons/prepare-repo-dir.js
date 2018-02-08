const fs = require('fs-extra')
const path = require('path')
const git = require('simple-git/promise')

const {
    pathname,
} = require('../vars')

const repos = {
    pics: 'git@github.com:TeamFleet/WhoCallsTheFleet-Pics.git',
    database: 'git@github.com:TeamFleet/WhoCallsTheFleet-DB.git'
}

module.exports = async type => new Promise(async (resolve, reject) => {
    // 确保repo目录
    // 如果存在，检查是否为repo
    // 如果不为repo，清空目录
    // 如果不存在或不为repo，执行clone
    if (type == 'db') type = 'database'

    if (!(type in repos))
        return reject(new Error('请输入正确的代码库类型'))

    const dir = pathname[`repo` + type.substr(0, 1).toUpperCase() + type.substr(1)]
    const repoURL = repos[type]

    let exist = fs.existsSync(dir)

    if (fs.existsSync(dir) && !fs.lstatSync(dir).isDirectory()) {
        fs.removeSync(dir)
        exist = false
    }

    fs.ensureDirSync(dir)

    const isRepo = (
        await git(dir).checkIsRepo() &&
        fs.existsSync(path.resolve(dir, '.git'))
    )

    if (!isRepo)
        await fs.emptyDir(dir)

    if (!isRepo || !exist) {
        try {
            await git().clone(repoURL, dir, [
                '--single-branch',
            ])
        } catch (err) {
            return reject(err)
        }
    }

    try {
        await git(dir).pull()
    } catch (err) {
        return reject(err)
    }

    return resolve()
})