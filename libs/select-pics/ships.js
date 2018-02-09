const {
    db,
    pathname,
} = require('../vars')

module.exports = async () => new Promise(async (resolve, reject) => {
    let ships = []
    for (const id in db.ships) {
        const ship = db.ships[id]
        if (typeof ship === 'object' && typeof ship.name === 'object')
            ships.push(ship)
    }
    ships = ships.sort((a, b) => a.id - b.id)

    for (const ship of ships) {
        await new Promise((resolve, reject) => {
            const illusts = ship._extraIllust || []
            illusts.unshift(-1)
            console.log(
                `${(ship.id + '').padStart(4, ' ')} ┌── ${ship._name}`
                + '\n' + `     └── ${illusts.join(', ')}`
            )
            resolve()
        })
            .catch(err => reject(err))
    }
    resolve()
})