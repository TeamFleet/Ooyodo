const fs = require('fs-extra')
const path = require('path')
const md5 = require('md5-file/promise')

const { enemyIdStartFrom, db, pathname } = require('../libs/vars')
const spinner = require('../libs/commons/spinner')
const readDirIds = require('../libs/commons/read-dir-ids')
const copyFiles = require('../libs/commons/copy-files')
// const run = require('../libs/select-pics/ships')

const filePicsVersions = pathname.fetched.versions.ships
const dirFetchedShips = pathname.fetched.pics.ships
const dirExistShips = path.resolve(pathname.repoPics, 'dist/ships')
const dirExistShipsExtra = path.resolve(pathname.repoPics, 'dist/ships-extra')
const dirNewShips = path.resolve(pathname.newPics, 'ships')
const dirNewShipsExtra = path.resolve(pathname.newPics, 'ships-extra')

const filesDefault = ['8.png', '9.png']

module.exports = async (versionsOld = {}) => {
    const step = '查找新的舰娘图片'
    const waiting = spinner(step)

    /** @type {Array} 新内容列表 */
    const newlist = []

    const checkId = (id) => id < enemyIdStartFrom

    // /* TEMP */ versionsOld = {}
    const versionsNew = await fs.readJson(filePicsVersions)

    const fetchedIds = await readDirIds(dirFetchedShips, checkId)
    const existIds = await readDirIds(dirExistShips, checkId)

    await fs.ensureDir(dirNewShips)
    await fs.ensureDir(dirNewShipsExtra)

    const add = ({
        type = 'ship-new',
        id,
        pics = filesDefault,
        infos
    }) => {
        if (type === 'new')
            type = 'ship-new'
        if (type === 'new-file')
            type = 'ship-new-file'
        if (type === 'extra')
            type = 'ship-extra'
        const ship = db.ships[id]
        const name = ship ? ship._name : undefined
        const obj = {
            type,
            item: ship,
            id,
            files: pics.map(filename =>
                path.resolve(dirFetchedShips, `${id}`, filename)
            ),
            infos,
        }
        if (name) {
            obj.name = name
        }
        newlist.push(obj)
    }

    // 查找: 新舰娘
    {
        fetchedIds.filter(id => !existIds.includes(id))
            .forEach(id => {
                const dir = path.resolve(dirFetchedShips, `${id}`)
                add({
                    id,
                    pics: fs.readdirSync(dir)
                })
            })
    }

    // 查找: 已有舰娘的新文件 (如 special)
    {
        existIds.forEach(id => {
            if (!fetchedIds.includes(id))
                return

            const dirFetched = path.resolve(dirFetchedShips, `${id}`)
            const dirExist = path.resolve(dirExistShips, `${id}`)

            const filesNew = fs.readdirSync(dirFetched)
                .filter(filename => !fs.existsSync(path.resolve(dirExist, filename)))

            if (!filesNew.length)
                return

            add({
                id,
                type: 'new-file',
                pics: filesNew,
                infos: filesNew.map(file => path.basename(file).replace(path.extname(file), ''))
            })
        })
    }

    // 查找: 已有舰娘的图鉴更新
    // 对比新下载的文件和该舰娘所有已知图鉴
    {
        const updated = Object.keys(versionsNew)
            .filter(id => (
                !(id in versionsOld) ||
                versionsOld[id] != versionsNew[id]
            ))
            .map(id => parseInt(id))
            .filter(checkId)
            .filter(id => !!db.ships[id])
            .sort((a, b) => a - b)

        for (let id of updated) {
            // 检查主图鉴
            let md5Fetched = ''
            let md5Exist = ''

            const dirFetched = path.resolve(dirFetchedShips, `${id}`)
            const dirExist = path.resolve(dirExistShips, `${id}`)
            const filesFetched = []

            for (let filename of filesDefault) {
                const fileFetched = path.resolve(dirFetched, filename)
                const fileExist = path.resolve(dirExist, filename)
                filesFetched.push(fileFetched)
                if (fs.existsSync(fileFetched))
                    md5Fetched += await md5(fileFetched)
                if (fs.existsSync(fileExist))
                    md5Exist += await md5(fileExist)
            }

            // 如果主图鉴相同，执行下一个
            if (md5Fetched === md5Exist) continue

            // 对比新下载的图鉴文件和该舰娘所有已知限定图鉴
            const ship = db.ships[id]
            let extraCgHasMatch = false
            const extraCgIds = ship._extraIllust || []
            for (let cgId of extraCgIds) {
                let md5ExistExtra = ''
                const dirExistExtra = path.resolve(dirExistShipsExtra, `${cgId}`)
                for (let filename of filesDefault) {
                    const fileExistExtra = path.resolve(dirExistExtra, filename)
                    if (fs.existsSync(fileExistExtra))
                        md5ExistExtra += await md5(fileExistExtra)
                }
                if (md5Fetched == md5ExistExtra) {
                    extraCgHasMatch = true
                    break
                }
            }

            if (extraCgHasMatch) continue

            add({
                id,
                type: 'extra',
                pics: filesFetched
            })
        }
    }

    // await run()
    //     .then(newlist => {
    //         if (Array.isArray(newlist) && newlist.length) {
    //             waiting.finish()
    //             newpics = newpics.concat(newlist)
    //             console.log(
    //                 newlist.map(obj => {
    //                     let msg = '  \x1b[92m' + '✦ NEW!✦ ' + '\x1b[0m'
    //                         + (obj.id + '').padStart(3, ' ')
    //                         + ' - '

    //                     if (typeof obj.ship === 'object') {
    //                         if (obj.ship.id == obj.id) {
    //                             msg += obj.ship._name
    //                         } else {
    //                             msg += `[${obj.ship.id}] ${obj.ship._name}`
    //                         }
    //                     } else if (obj.ship === true) {
    //                         msg += '新舰娘'
    //                     } else if (typeof obj.ship === 'string') {
    //                         msg += obj.ship
    //                     }

    //                     return msg
    //                 }).join('\n')
    //             )
    //         } else {
    //             waiting.finish(step + ': 无新图')
    //         }
    //     })
    //     .catch(err => waiting.error(step, err))

    waiting.finish()

    if (!newlist.length) {
        console.log('   无新增')
        return
    }

    const copyList = []
    newlist.forEach(o => {
        const { type, id, name, files, infos } = o
        const log = (typename) => {
            let msg = `   `
                + typename
                + ` [${id}]`
                + (name ? ` ${name}` : '')
                + (Array.isArray(infos) ? ` (${infos.join(', ')})` : '')
            console.log(msg)
        }
        switch (type) {
            case 'ship-new': {
                log(`新舰娘`)
                files.forEach(file => {
                    copyList.push([
                        file,
                        path.resolve(dirNewShips, `${id}`, path.basename(file))
                    ])
                })
                break
            }
            case 'ship-new-file': {
                log(`新图鉴类型`)
                files.forEach(file => {
                    copyList.push([
                        file,
                        path.resolve(dirNewShips, `${id}`, path.basename(file))
                    ])
                })
                break
            }
            case 'ship-extra': {
                log(`新图鉴`)
                files.forEach(file => {
                    copyList.push([
                        file,
                        path.resolve(dirNewShipsExtra, `_${id}`, path.basename(file))
                    ])
                })
                break
            }
        }
    })
    await copyFiles(copyList, '复制新的舰娘图片')
    // newlist.forEach(item => {
    //     const { type, id, name, files } = item
    //     console.log({ type, id, name, files })
    // })

    return newlist
}
