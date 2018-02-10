const fs = require('fs-extra')
const path = require('path')
const ncp = require('ncp').ncp

const {
    pathname,
} = require('../vars')

ncp.limit = 16

const copy = async obj => {
    let target, targetNew, id
    if (obj.shipExIllust) {
        id = obj.id
        target = path.resolve(pathname.repoPics, `./dist/ships-extra/${id}`)
        targetNew = path.resolve(pathname.newPics, `./ships-extra/${id}`)
    } else if (obj.ship) {
        id = typeof obj.ship === 'object' ? obj.ship.id : obj.id
        target = path.resolve(pathname.repoPics, `./dist/ships/${id}`)
        targetNew = path.resolve(pathname.newPics, `./ships/${id}`)
    } else if (obj.equipment) {
        id = obj.equipment.id
        target = path.resolve(pathname.repoPics, `./dist/equipments/${id}`)
        targetNew = path.resolve(pathname.newPics, `./equipments/${id}`)
    }

    await fs.ensureDir(targetNew)
    await fs.emptyDir(target)

    for (const file of obj.files) {
        await new Promise((resolve, reject) => {
            ncp(
                file,
                path.resolve(target, path.basename(file)),
                err => {
                    if (err) return reject(err)
                    resolve()
                }
            );
        })
        await new Promise((resolve, reject) => {
            ncp(
                file,
                path.resolve(targetNew, path.basename(file)),
                err => {
                    if (err) return reject(err)
                    resolve()
                }
            );
        })
    }
    // console.log(id, obj.files)
}

module.exports = async (list) => new Promise(async (resolve, reject) => {
    await fs.ensureDir(pathname.newPics)
    await fs.emptyDir(pathname.newPics)

    for (const obj of list) {
        try {
            await copy(obj)
        } catch (err) {
            reject(err)
        }
    }
    resolve()
})