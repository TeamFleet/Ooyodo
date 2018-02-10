const fs = require('fs-extra')
const path = require('path')

const {
    db,
    pathname,
    enemyEquipmentIdStartFrom,
} = require('../vars')

module.exports = async () => new Promise(async (resolve, reject) => {
    const newlist = []

    // 检查新增
    {
        const dir = path.resolve(pathname.fetched.pics.equipments)
        const list = await fs.readdir(dir)
        const apiStart2 = await fs.readJSON(pathname.apiStart2)

        if (typeof apiStart2 !== 'object' ||
            typeof apiStart2.api_data !== 'object' ||
            typeof apiStart2.api_data.api_mst_slotitem !== 'object') {
            return reject('api_start2.json 已损坏，请提供 token 以重新下载')
        }

        list
            .filter(filename => {
                if (isNaN(filename) ||
                    !fs.lstatSync(path.resolve(dir, filename)).isDirectory()
                )
                    return false

                const id = parseInt(filename)

                if (id >= enemyEquipmentIdStartFrom ||
                    id in db.equipments
                )
                    return false

                return true
            })
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(filename => {
                const id = parseInt(filename)
                let equipment = id
                apiStart2.api_data.api_mst_slotitem.some(o => {
                    if (id == o.api_id) {
                        equipment = {
                            id,
                            name: o.api_name
                        }
                        return true
                    }
                    return false
                })
                return equipment
            })
            .filter(equipment => typeof equipment === 'object')
            .forEach(equipment => {
                const dirEquipment = path.resolve(
                    dir,
                    `./${equipment.id}`
                )
                const files = fs.readdirSync(path.resolve(dirEquipment))
                newlist.push({
                    id: equipment.id,
                    equipment: equipment.name,
                    files: files.map(filename => (
                        path.resolve(dirEquipment, filename)
                    ))
                })
            })
    }

    resolve(newlist)
})