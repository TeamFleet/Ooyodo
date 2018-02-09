const fs = require('fs-extra')
const path = require('path')
const md5File = require('md5-file/promise')

const {
    db,
    pathname,
} = require('../vars')

const check = [
    8, 9,
]

module.exports = async () => new Promise(async (resolve, reject) => {
    let ships = []
    for (const id in db.ships) {
        const ship = db.ships[id]
        if (typeof ship === 'object' && typeof ship.name === 'object')
            ships.push(ship)
    }
    ships = ships.sort((a, b) => a.id - b.id)

    let exIllustsCurrentId = 0
    for (const key in db.exillusts) {
        exIllustsCurrentId = Math.max(
            parseInt(db.exillusts[key].id),
            exIllustsCurrentId
        )
    }
    exIllustsCurrentId++

    for (const ship of ships) {
        // 目录资源
        const dir = {
            extracted: path.resolve(pathname.fetched.pics.ships, `./extract/${ship.id}`),
            ship: path.resolve(pathname.repoPics, `./dist/ships/${ship.id}`)
        }

        // 确定已有的图片
        const pics = ([0].concat(ship._extraIllust || []))
            .map(id => ({
                id,
                name: (() => {
                    switch (parseInt(id)) {
                        case 0: return '原'
                        default: {
                            if (db.exillusts[id] && db.exillusts[id].type) {
                                return `${db.exillustTypes[db.exillusts[id].type]._name}`
                            }
                            return id
                        }
                    }
                })(),
                matched: false,
            }))

        await new Promise(async (resolve, reject) => {
            const matched = {}
            const md5 = {}
            for (const picId of check) {
                const file = path.resolve(dir.extracted, `${picId}.png`)
                if (!fs.existsSync(file))
                    return resolve()
                matched[picId] = false
                md5[picId] = await md5File(file)
            }

            for (const pic of pics) {
                const files = {}
                const ids = []
                for (const picId of check) {
                    if (pic.id == 0) {
                        files[picId] = path.resolve(dir.ship, `${picId}.png`)
                        ids.push(picId)
                    } else if (pic.id > 0) {
                        const exillust = db.exillusts[pic.id]
                        if (!Array.isArray(exillust.exclude) ||
                            !exillust.exclude.includes(picId)) {
                            files[picId] = path.resolve(
                                pathname.repoPics,
                                `./dist/ships-extra/${pic.id}/${picId}.png`
                            )
                            ids.push(picId)
                        }
                    }
                }

                let allMatch = true
                for (const picId of ids) {
                    const file = files[picId]
                    const md5check = await md5File(file)
                    if (md5check == md5[picId]) {
                        matched[picId] = pic.id
                    } else {
                        allMatch = false
                    }
                }
                pic.matched = allMatch
            }

            // let matchedOriginal = check.every(picId => (
            //     matched[picId] === 0
            // ))

            if (!pics.some(obj => obj.matched)) {
                console.log(
                    `${(ship.id + '').padStart(4, ' ')} ${ship._name}`
                    + '\n'
                    + pics.map((obj, index) => (
                        `     ${index < pics.length - 1 ? '├' : '└'} `
                        + (obj.matched ? '\x1b[32m' : '')
                        + `[${(obj.id + '').padStart(3, ' ')}] `
                        + obj.name
                        + '\x1b[0m'
                    )).join('\n')
                    + '\n'
                )
            }

            resolve()
        })
            .catch(err => reject(err))
    }
    resolve()
})