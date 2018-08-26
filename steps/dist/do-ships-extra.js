const fs = require('fs-extra')
const path = require('path')

const {
    pathname: {
        repoPics
    },
} = require('../../libs/vars')
const spinner = require('../../libs/commons/spinner')
const batch = require('./batch')

module.exports = async () => {
    const title = '舰娘限定'
    const waiting = spinner(title)

    const picsNames = {
        app: [
            '8.webp', '9.webp',
        ],
        webApp: [
            '8.png', '8.webp', '9.png', '9.webp',
        ],
        pwa: [
            '8.png', '8.webp', '9.png', '9.webp',
        ]
    }

    const folder = path.resolve(repoPics, 'dist/ships-extra')
    const list = []

    const ids = (await fs.readdir(folder))
        .filter(filename => {
            const stat = fs.lstatSync(path.resolve(folder, filename))
            return stat.isDirectory()
        })
        .map(filename => parseInt(filename))
        .sort((a, b) => a - b)

    for (let id of ids) {
        for (let type of Object.keys(picsNames)) {
            for (let filename of picsNames[type]) {
                list.push({
                    category: 'ships-extra',
                    type,
                    id: id,
                    filename,
                })
            }
        }
    }

    waiting.stop()
    await batch(title, list)
}
