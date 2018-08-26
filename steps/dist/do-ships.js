const createDatastore = require('../../libs/commons/create-datastore')
const spinner = require('../../libs/commons/spinner')
const batch = require('./batch')

module.exports = async () => {
    const title = '舰娘'
    const waiting = spinner(title)

    const picsNames = {
        app: [
            '0.webp',
            '8.webp', '9.webp', '10.webp',
        ],
        webApp: [
            '0.png', '0.webp',
            '0-1.png', '0-2.png',
            '2.png',
            '8.png', '8.webp', '9.png', '9.webp', '10.png', '10.webp',
        ],
        pwa: [
            '0.png', '0.webp',
            '0-1.png', '0-1.webp', '0-2.png', '0-2.webp',
            '8.png', '8.webp', '9.png', '9.webp', '10.png', '10.webp',
        ]
    }
    const sameAsPrevPicIdsIgnore = [
        8, 9, 10, 11
    ]

    const db = await createDatastore()
    const allSeries = (await db.shipSeries.find({}))
        .sort((a, b) => parseInt(a.id) - parseInt(b.id))
    // const count = allSeries.reduce((prev, current) => (
    //     prev + current.ships.length
    // ), 0)
    const list = []

    for (let series of allSeries) {
        for (let ship of series.ships) {
            const sameAsPrev = ship.illust_delete ? true : false
            for (let type of Object.keys(picsNames)) {
                for (let filename of picsNames[type]) {
                    if (sameAsPrev && sameAsPrevPicIdsIgnore.some(id => filename.includes(`${id}.`)))
                        continue
                    list.push({
                        category: 'ships',
                        type,
                        id: ship.id,
                        filename,
                    })
                }
            }
        }
    }

    waiting.stop()
    await batch(title, list)
}