const fs = require('fs-extra')
const path = require('path')
const md5File = require('md5-file/promise')

const {
    db,
    pathname,
    enemyIdStartFrom,
} = require('../vars')

const check = [
    8, 9,
]

module.exports = async () => new Promise(async (resolve, reject) => {
    const newlist = []

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

    // 检查新增
    {
        const dir = path.resolve(pathname.fetched.pics.ships, `./extract`)
        const list = await fs.readdir(dir)
        const apiStart2 = await fs.readJSON(pathname.apiStart2)

        if (typeof apiStart2 !== 'object' ||
            typeof apiStart2.api_data !== 'object' ||
            typeof apiStart2.api_data.api_mst_ship !== 'object') {
            return reject('api_start2.json 已损坏，请提供 token 以重新下载')
        }

        list
            .filter(filename => {
                if (isNaN(filename) ||
                    !fs.lstatSync(path.resolve(dir, filename)).isDirectory()
                )
                    return false

                const id = parseInt(filename)

                if (id >= enemyIdStartFrom ||
                    id in db.ships
                )
                    return false

                return true
            })
            .sort((a, b) => parseInt(a) - parseInt(b))
            .map(filename => {
                const id = parseInt(filename)
                let ship = id
                apiStart2.api_data.api_mst_ship.some(o => {
                    if (id == o.api_id) {
                        ship = {
                            id,
                            name: o.api_name
                        }
                        return true
                    }
                    return false
                })
                return ship
            })
            .filter(ship => typeof ship === 'object')
            .forEach(ship => {
                newlist.push({
                    id: ship.id,
                    ship: ship.name,
                    files: check.map(picId => (
                        path.resolve(
                            dir,
                            `./${ship.id}/${picId}.png`
                        )
                    ))
                })
            })
    }

    // 检查已在库中的
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
            try {
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
                            const file = path.resolve(dir.ship, `${picId}.png`)
                            files[picId] = file
                            ids.push(picId)
                        } else if (pic.id > 0) {
                            const exillust = db.exillusts[pic.id]
                            if (!Array.isArray(exillust.exclude) ||
                                !exillust.exclude.includes(picId)
                            ) {
                                const file = path.resolve(
                                    pathname.repoPics,
                                    `./dist/ships-extra/${pic.id}/${picId}.png`
                                )
                                if (fs.existsSync(file)) {
                                    files[picId] = file
                                    ids.push(picId)
                                }
                            }
                        }
                    }

                    let allMatch = ids.length > 0 ? true : false
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
                    // console.log(
                    //     `${(ship.id + '').padStart(4, ' ')} ${ship._name}`
                    //     + '\n'
                    //     + pics.map((obj, index) => (
                    //         `     ${index < pics.length - 1 ? '├' : '└'} `
                    //         + (obj.matched ? '\x1b[32m' : '')
                    //         + `[${(obj.id + '').padStart(3, ' ')}] `
                    //         + obj.name
                    //         + '\x1b[0m'
                    //     )).join('\n')
                    //     + '\n'
                    // )

                    let didCheck = false
                    let newMatch = true
                    for (const obj of newlist) {
                        const {
                            ship: thatShip
                        } = obj
                        if (ship.series !== thatShip.series) {
                            continue
                        }
                        for (const picId of check) {
                            const file = path.resolve(
                                pathname.fetched.pics.ships,
                                `./extract/${thatShip.id}/${picId}.png`
                            )
                            const thatMD5 = await md5File(file)
                            didCheck = true
                            if (thatMD5 != md5[picId]) {
                                newMatch = false
                            }
                        }
                    }
                    if (!didCheck || !newMatch) {
                        const files = []
                        for (const picId of check) {
                            const file = path.resolve(
                                dir.ship,
                                `./${picId}.png`
                            )
                            const shipPicMD5 = await md5File(file)
                            if (shipPicMD5 != md5[picId]) {
                                files.push(
                                    path.resolve(
                                        dir.extracted,
                                        `./${picId}.png`
                                    )
                                )
                            }
                        }
                        newlist.push({
                            id: exIllustsCurrentId,
                            ship,
                            shipExIllust: true,
                            files
                        })
                        exIllustsCurrentId++
                    }
                }
            } catch (err) {
                reject(err)
            }

            resolve()
        })
            .catch(err => reject(err))
    }

    resolve(newlist)
})