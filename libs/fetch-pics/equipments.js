const path = require('path')
const url = require('url')
const fs = require('fs-extra')

const {
    enemyEquipmentIdStartFrom,
    pathname,
} = require('../vars')
const getFile = require('../commons/get-file')

/*
 * CARD     http://203.104.209.23/kcs/resources/image/slotitem/card/211.png
 * SPRITE   http://203.104.209.23/kcs/resources/image/slotitem/item_character/211.png
 * FULL     http://203.104.209.23/kcs/resources/image/slotitem/item_on/211.png
 * ITEM     http://203.104.209.23/kcs/resources/image/slotitem/item_up/211.png
 * TITLE    http://203.104.209.23/kcs/resources/image/slotitem/statustop_item/211.png
 */

/*
fetched_data
`-- pics
    `-- equipments
        +-- 1
            +-- card.png
            +-- item_character.png
            +-- item_on.png
            +-- item_up.png
            `-- statustop_item.png
        +-- 2
        `-- ...id
*/

const dirFetchedData = pathname.fetchedData

/**
 * 获取装备图片资源
 * 
 * @param {onProgressCallback} onProgress - 每下载一个舰娘的图片后会执行的回调函数
 * @param {Object} proxy - 代理服务器设置
 * @return {promise}
 */
/**
 * 每下载一个舰娘的图片后会执行的回调函数
 * @callback onProgressCallback
 * @param {Object} obj
 * @param {Object} obj.equipment - 当前完成的装备的元数据
 * @param {number} obj.index - 当前完成的index
 * @param {number} obj.length - 有效总数
 */
module.exports = async (onProgress, proxy) => new Promise(async (resolve, reject) => {
    const dirPicsEquipments = path.join(dirFetchedData, 'pics', 'equipments')
    fs.ensureDirSync(dirPicsEquipments)

    const fileApiStart2 = pathname.apiStart2
    // console.log('  Fetching all equipments\' illustrations...')

    if (!fs.existsSync(fileApiStart2))
        return reject('api_start2 不存在')

    const apiStart2 = fs.readJSONSync(fileApiStart2)
    if (typeof apiStart2 !== 'object' ||
        typeof apiStart2.api_data !== 'object' ||
        typeof apiStart2.api_data.api_mst_slotitem !== 'object') {
        return reject('api_start2.json 已损坏，请提供 token 以重新下载')
    }
    let {
        api_mst_slotitem: slotitem,
    } = apiStart2.api_data

    const pics = [
        'card',
        'item_character',
        'item_on',
        'item_up',
        'statustop_item'
    ]

    slotitem = slotitem.filter(obj => {
        const id = parseInt(obj.api_id)
        if (id >= enemyEquipmentIdStartFrom) {
            return false
        }
        const dir = path.join(dirPicsEquipments, '' + id)
        if (fs.existsSync(dir)) {
            // console.log(`  │       EXIST [${id}] ${name}`)
            return false
        }
        return true
    })

    let completeIndex = 0
    let length = slotitem.length

    for (let obj of slotitem) {
        const id = parseInt(obj.api_id)
        // const name = obj.api_name
        const dir = path.join(dirPicsEquipments, '' + id)

        fs.ensureDirSync(dir)
        await new Promise(async (resolve/*, reject*/) => {
            // console.log(`  │       Fetching images for equipment [${id}] ${name}`)

            let theId
            if (id < 10) theId = '00' + id
            else if (id < 100) theId = '0' + id
            else theId = id

            let fail = false

            for (let type of pics) {
                if (fail) continue
                await getFile(
                    url.parse(`http://203.104.209.23/kcs/resources/image/slotitem/${type}/${theId}.png`),
                    path.join(dir, `${type}.png`),
                    proxy
                )
                    .catch(err => {
                        // isDownloadSuccess = false
                        if (err == 404 || err.message == 404)
                            return

                        fail = true

                        // 删除当前的目录
                        fs.emptyDirSync(dir)
                        fs.removeSync(dir)

                        resolve(false)
                        // reject(err)
                        // console.log("  │       Fetched error: ", err)
                    })
                // .catch(err => console.log("  │       Fetched error:", err))
                // console.log(`  │           ${id}/${type}.png`)
            }

            if (typeof onProgress === 'function')
                onProgress({
                    equipment: obj,
                    index: completeIndex,
                    length
                })

            completeIndex++
            resolve()
        })
            .catch(err => reject(err))
    }

    // console.log('  └── Finished.')
    resolve()
})