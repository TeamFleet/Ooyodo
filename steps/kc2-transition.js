const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')
const md5File = require('md5-file')

const spinner = require('../libs/commons/spinner')
const createDatastore = require('../libs/commons/create-datastore')
const {
    db: data,
    pathname,
    enemyIdStartFrom, enemyEquipmentIdStartFrom,
} = require('../libs/vars')
const confirmedSameAsPrev = require('../libs/ships-pic-same-as-prev')

const dirKC2 = path.resolve(__dirname, '../.kc2')
const dirKC2Ships = path.resolve(dirKC2, 'ships')
const dirKC2ShipsExtra = path.resolve(dirKC2, 'ships-extra')
const dirKC2Equipments = path.resolve(dirKC2, 'equipments')
const dirKC2Enemies = path.resolve(dirKC2, 'enemies')

/**
 * KC2 过渡期处理
 * @async
 */
module.exports = async () => {
    console.log('\n' + chalk.redBright('当前为 KC2 过渡期'))

    const stepPrepration = spinner('准备数据')

    const apiStart2 = await fs.readJson(pathname.apiStart2)
    const picVersionsShips = await fs.readJson(pathname.fetched.versions.ships)
    const picVersionsEquipments = await fs.readJson(pathname.fetched.versions.equipments)

    const db = await createDatastore()

    const shipIds = Object.keys(data.ships)
        .filter(id => id < enemyIdStartFrom)
        .map(id => parseInt(id))
    const equipmentIds = Object.keys(data.equipments)
        .filter(id => id < enemyEquipmentIdStartFrom)
        .map(id => parseInt(id))

    stepPrepration.finish()

    // 删除 pics repo 中多余的图片
    const doDeleteRepo = false
    if (doDeleteRepo) {
        const stepRemoveShipPics = spinner('删除 pics repo 中多余的图片')
        const remove = async (root, filesToRemove) => {
            const dirs = (await fs.readdir(root))
                .filter(filename => {
                    const stats = fs.lstatSync(path.resolve(root, filename))
                    return stats.isDirectory()
                })
                .map(filename => parseInt(filename))
                .sort((a, b) => a - b)
                .map(id => path.resolve(root, '' + id))
            for (let dir of dirs) {
                for (let filename of filesToRemove) {
                    const pathname = path.resolve(dir, filename)
                    if (!fs.existsSync(pathname)) continue
                    await fs.remove(pathname)
                }
            }
        }
        await remove(
            path.resolve(pathname.repoPics, 'dist', 'ships'),
            [
                '0.jpg', '0.webp',
                '0-1.png', '0-1.webp',
                '0-2.png', '0-2.webp',
                '1.jpg', '1.png', '1.webp',
                '1-1.png', '1-1.webp',
                '1-2.png', '1-2.webp',
                '2.jpg', '2.webp',
                '3.jpg', '3.png', '3.webp',
                '4.png', '4.webp',
                '5.png', '5.webp',
                '6.png', '6.webp',
                '7.png', '7.webp',
                '8.webp',
                '9.webp',
                '10.webp',
                '11.png', '11.webp',
                '12.png', '12.webp',
                '13.png', '13.webp',
                '14.png', '14.webp',
            ]
        )
        await remove(
            path.resolve(pathname.repoPics, 'dist', 'ships-extra'),
            [
                '2.jpg', '2.png', '2.webp',
                '3.jpg', '3.png', '3.webp',
                '8.webp',
                '9.webp'
            ]
        )
        await remove(
            path.resolve(pathname.repoPics, 'dist', 'enemies'),
            [
                '0.jpg',
                '1.png',
            ]
        )
        await remove(
            path.resolve(pathname.repoPics, 'dist', 'equipments'),
            [
                'card.webp',
                'item_character.png', 'item_character.webp',
                'item_on.png', 'item_on.webp',
                'item_up.png', 'item_up.webp',
                'statustop_item.png', 'statustop_item.webp'
            ]
        )
        // await remove(
        //     dirKC2ShipsExtra,
        //     [
        //         '0.png', '1.png',
        //         '2.png', '3.png',
        //         '10.png', '11.png'
        //     ]
        // )
        stepRemoveShipPics.succeed()
    }

    // 图片更名
    const doRename = false
    if (doRename) {
        const step = spinner('图片更名')
        const pairs = [
            ['6.png', '8.png'],
            ['7.png', '9.png']
        ]
        const getDirs = async (pathname) => {
            return (await fs.readdir(pathname))
                .filter(filename => {
                    const stats = fs.lstatSync(path.resolve(pathname, filename))
                    return stats.isDirectory()
                })
                .map(filename => parseInt(filename))
                .sort((a, b) => a - b)
                .map(id => path.resolve(pathname, '' + id))
        }
        const dirs = [
            ...await getDirs(dirKC2Ships),
            ...await getDirs(dirKC2ShipsExtra),
            ...await getDirs(dirKC2Enemies)
        ]
        for (let dir of dirs) {
            for (let pair of pairs) {
                const src = path.resolve(dir, pair[0])
                const to = path.resolve(dir, pair[1])
                if (!fs.existsSync(src)) continue
                await fs.rename(src, to)
            }
        }
        step.succeed()
    }

    // 更新数据：舰娘图鉴版本
    const doUpdateShipsVersions = true
    if (doUpdateShipsVersions) {
        const stepShipsUpdatePicVersion = spinner('更新数据：舰娘图鉴版本')
        // console.log(db.ships)
        for (let id of shipIds) {
            const picVersion = picVersionsShips[id] || 0
            // const ship = await db.ships.find({ id })
            const update = {}
            if (picVersion) {
                update['$set'] = {
                    illust_version: picVersion
                }
            } else {
                update['$unset'] = {
                    illust_version: true
                }
            }
            await db.ships.update(
                { id },
                update
            )
            // console.log(id, picVersion, ship)
        }
        stepShipsUpdatePicVersion.finish()
    }

    // 复制 ships-extra 目录内容到 ships
    const doCopyExtra = false
    if (doCopyExtra) {
        const stepShipsCopyExtras = spinner('复制文件：extra')
        const dirs = (await fs.readdir(dirKC2ShipsExtra))
            .filter(filename => {
                const stats = fs.lstatSync(path.resolve(dirKC2ShipsExtra, filename))
                return stats.isDirectory()
            })
            .map(filename => parseInt(filename))
            .sort((a, b) => a - b)
        const filesToCopy = [
            '0.png', '1.png',
            '2.png', '3.png',
            '10.png', '11.png'
        ]
        for (let id of dirs) {
            for (let filename of filesToCopy) {
                const pathname = path.resolve(dirKC2ShipsExtra, '' + id, filename)
                if (!fs.existsSync(pathname)) continue
                await fs.ensureDir(path.resolve(dirKC2Ships, '' + id))
                await fs.copyFile(
                    pathname,
                    path.resolve(dirKC2Ships, '' + id, filename)
                )
            }
        }
        stepShipsCopyExtras.finish()
    }

    // 遍历 ship_series
    //  a. 删除 1.png、2.png、3.png、11.png
    //  b. 如果为改造版本且存在 6.png、7.png，比对 6.png、7.png 和前一个版本是否相同
    //         * 如果相同，删除该文件夹内的 6.png、7.png，同时标记 db 内的相关字段
    //         * 如果不相同，移除 db 内的相关字段
    const doIterateSeries = true
    if (doIterateSeries) {
        const stepShipsUpdateSameAsPrev = spinner('更新数据：舰娘图鉴是否和前一个改造版本相同')
        const filesToHash = [
            '8.png', '9.png'
        ]
        const sizeThreshold = 100
        const updateSameAsPrev = async (seriesId, shipId, value = false) => {
            await db.ships.update(
                { id: shipId },
                (() => {
                    if (value) {
                        return {
                            '$set': {
                                illust_same_as_prev: true
                            }
                        }
                    } else {
                        return {
                            '$unset': {
                                illust_same_as_prev: true
                            }
                        }
                    }
                })()
            )

            const series = await db.shipSeries.findOne({ id: seriesId })
            const ships = series.ships.map(ship => {
                if (ship.id == shipId) {
                    const newShip = Object.assign({}, ship)
                    if (value) {
                        newShip.illust_delete = 'on'
                    } else {
                        delete newShip.illust_delete
                    }
                    return newShip
                } else {
                    return ship
                }
            })
            await db.shipSeries.update(
                { id: series.id },
                {
                    '$set': { ships }
                }
            )
        }
        for (let series of Object.values(data.shipSeries)) {
            const { id, _id, ships } = series
            // console.log(ships)
            let lastHash = ''
            let lastSize = 0
            for (let ship of ships) {
                if (confirmedSameAsPrev.includes(ship.id)) {
                    await updateSameAsPrev(id, ship.id, true)
                } else {
                    let thisHash = ''
                    let thisSize = 0
                    for (let filename of filesToHash) {
                        const pathname = path.resolve(dirKC2Ships, `${ship.id}`, filename)
                        if (fs.existsSync(pathname)) {
                            thisHash += await new Promise(resolve => {
                                md5File(pathname, (err, hash) => {
                                    resolve(hash)
                                })
                            })
                            const stats = fs.lstatSync(pathname)
                            thisSize += stats.size
                        }
                    }
                    if (thisHash && lastHash) {
                        if (thisHash === lastHash) {
                            await updateSameAsPrev(id, ship.id, true)
                            // console.log(ship.id, Boolean(ship.illust_delete))
                        } else {
                            await updateSameAsPrev(id, ship.id, false)
                            // console.log(ship.id, Boolean(ship.illust_delete), Math.abs(thisSize - lastSize))
                        }
                    }
                    lastHash = thisHash
                    lastSize = thisSize
                }
            }
        }
        stepShipsUpdateSameAsPrev.finish()
    }

    // 更新装备数据：图片版本
    const doUpdateEquipmentsVersions = true
    if (doUpdateEquipmentsVersions) {
        const stepEquipmentsUpdatePicVersion = spinner('更新数据：装备图鉴版本')
        // console.log(db.ships)
        for (let id of equipmentIds) {
            const picVersion = picVersionsEquipments[id] || 0
            // const ship = await db.ships.find({ id })
            const update = {}
            if (picVersion) {
                update['$set'] = {
                    illust_version: picVersion
                }
            } else {
                update['$unset'] = {
                    illust_version: true
                }
            }
            await db.equipments.update(
                { id },
                update
            )
            // console.log(id, picVersion, ship)
        }
        stepEquipmentsUpdatePicVersion.finish()
    }

    // 保存数据
    const doCompactNeDBs = true
    if (doCompactNeDBs) {
        const stepCompactNeDBs = spinner('保存数据')
        for (let store of Object.values(db)) {
            store.nedb.persistence.compactDatafile()
            await new Promise(resolve => {
                setTimeout(() => resolve(), 500)
            })
        }
        stepCompactNeDBs.succeed()
    }

    // 复制图片至 pics repo
    const doCopyPics = false
    if (doCopyPics) {
        const step = spinner('复制图片')
        const copy = async (from, dest, filesToCopy) => {
            const ids = (await fs.readdir(from))
                .filter(filename => {
                    const stats = fs.lstatSync(path.resolve(from, filename))
                    return stats.isDirectory()
                })
                .map(filename => parseInt(filename))
                .sort((a, b) => a - b)

            for (let id of ids) {
                const dirFrom = path.resolve(from, `${id}`)
                const dirDest = path.resolve(dest, `${id}`)
                await fs.ensureDir(dirDest)
                for (let filename of filesToCopy) {
                    const from = path.resolve(dirFrom, filename)
                    if (!fs.existsSync(from)) continue
                    await fs.copyFile(
                        from,
                        path.resolve(dirDest, filename)
                    )
                }
            }
        }
        await copy(
            dirKC2Ships,
            path.resolve(pathname.repoPics, 'dist', 'ships'),
            [
                '0.png', '1.png',
                '2.png', '3.png',
                // '8.png', '9.png',
                '10.png', '11.png'
            ]
        )
        await copy(
            dirKC2Enemies,
            path.resolve(pathname.repoPics, 'dist', 'enemies'),
            [
                '0.png', '8.png'
            ]
        )
        await copy(
            dirKC2Equipments,
            path.resolve(pathname.repoPics, 'dist', 'equipments'),
            [
                'card.png',
                'item_character.png', 'item_on.png', 'item_up.png'
            ]
        )
        step.succeed()
    }


}
