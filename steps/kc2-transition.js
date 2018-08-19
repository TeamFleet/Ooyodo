const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

const spinner = require('../libs/commons/spinner')
const createDatastore = require('../libs/commons/create-datastore')
const { db: data, pathname, enemyIdStartFrom } = require('../libs/vars')

const dirKC2 = path.resolve(__dirname, '../.kc2')
const dirKC2Ships = path.resolve(dirKC2, 'ships')
const dirKC2ShipsExtra = path.resolve(dirKC2, 'ships-extra')

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

    stepPrepration.finish()

    /* 舰娘
        1. 依照 api_start2 的结果更新 db 的图鉴版本
        2. 复制 ships-extra 目录内容到 ships
            * 仅保留 0.png、10.png
        3. 遍历 ship_series
            a. 删除 1.png、2.png、3.png、11.png
            b. 如果为改造版本且存在 6.png、7.png，比对 6.png、7.png 和前一个版本是否相同
                * 如果相同，删除该文件夹内的 6.png、7.png，同时标记 db 内的相关字段
                * 如果不相同，移除 db 内的相关字段
    */
    // 1. 依照 api_start2 的结果更新 db 的图鉴版本
    {
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

    /* 复制 ships-extra 目录内容到 ships
        * 仅保留 0.png、10.png
    {
        const stepShipsCopyExtras = spinner('复制文件：extra')
        const dirs = (await fs.readdir(dirKC2ShipsExtra))
            .filter(filename => {
                const stats = fs.lstatSync(path.resolve(dirKC2ShipsExtra, filename))
                return stats.isDirectory()
            })
            .map(filename => parseInt(filename))
            .sort((a, b) => a - b)
        const filesToCopy = [
            '0.png', '10.png'
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
    */

    // 3. 遍历 ship_series
    //  a. 删除 1.png、2.png、3.png、11.png
    //  b. 如果为改造版本且存在 6.png、7.png，比对 6.png、7.png 和前一个版本是否相同
    //         * 如果相同，删除该文件夹内的 6.png、7.png，同时标记 db 内的相关字段
    //         * 如果不相同，移除 db 内的相关字段
    {
        
    }
    /* 装备
        1. 仅保留 card.png
        2. 依照 api_start2 的结果更新 db 的图鉴版本
    */
}
