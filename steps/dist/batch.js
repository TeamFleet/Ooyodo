const fs = require('fs-extra')
const path = require('path')
const ProgressBar = require('progress')

const dirs = require('./dirs')
const {
    spinner: spinnerAnimation,
    pathname: {
        repoPics
    },
} = require('../../libs/vars')
const spinner = require('../../libs/commons/spinner')

const getFolder = (type, category, id) => {
    switch (type) {
        case 'app': {
            if (category === 'equipments')
                return path.resolve(dirs[type], 'pics/items', '' + id)
            return path.resolve(dirs[type], `pics-${category}`, '' + id)
        }
        case 'webApp': {
            if (category === 'equipments')
                return path.resolve(dirs[type], 'pics/items', '' + id)
            if (category === 'entities')
                return path.resolve(dirs[type], 'pics/entities', '' + id)
            return path.resolve(dirs[type], `pics-${category}`, '' + id)
        }
        case 'pwa': {
            return path.resolve(dirs[type], category, '' + id)
        }
    }
    return path.resolve(dirs[type], category, '' + id)
}

module.exports = async (title, list = []) => {
    const total = list.length
    const bar = new ProgressBar(
        `:symbol ${title} [:bar] :current / :total`,
        {
            total,
            width: 20,
            complete: '■',
            incomplete: '─',
            clear: true,
            symbol: '\x1b[36m' + spinnerAnimation.frames[0] + '\x1b[0m'
        }
    )
    const failed = []

    let currentSpinnerFrame = 1
    const intervalSpinner = setInterval(() => {
        bar.tick(0, {
            symbol: '\x1b[36m' + spinnerAnimation.frames[currentSpinnerFrame] + '\x1b[0m'
        })
        currentSpinnerFrame++
        if (currentSpinnerFrame > spinnerAnimation.frames.length - 1)
            currentSpinnerFrame = 0
    }, spinnerAnimation.interval)

    for (let o of list) {
        const {
            category,
            type,
            id,
            filename
        } = o
        const from = path.resolve(repoPics, 'dist', category, '' + id, '' + filename)
        const to = getFolder(type, category, id)
        const dest = path.resolve(to, filename)
        try {
            await fs.ensureDir(to)
            await fs.copyFile(from, dest)
        } catch (error) {
            if (fs.existsSync(dest))
                await fs.remove(path.resolve(to, filename))
            failed.push({
                ...o,
                error
            })
        }
        bar.tick()
    }

    clearInterval(intervalSpinner)

    if (failed.length) {
        for (let o of failed) {
            console.log(o)
        }
    } else {
        spinner(title).succeed()
    }
}
