const ProgressBar = require('progress')

const {
    spinner: spinnerObj,
} = require('../vars')
const spinner = require('./spinner')

module.exports = async (title, run) => {
    const step = title
    const waiting = spinner(step)

    let bar
    let interval
    let currentFrame = 0
    let completed = 0
    let total = 0

    const symbolTicking = () => {
        let symbol = '\x1b[36m' + spinnerObj.frames[currentFrame] + '\x1b[0m'
        bar.tick(0, {
            symbol
        })
        currentFrame++
        if (currentFrame > spinnerObj.frames.length - 1)
            currentFrame = 0
    }

    await run(({
        // ship,
        // index,
        length
    }) => {
        // console.log(currentShipIndex, shipsCount)
        if (!bar) {
            total = length
            waiting.stop()
            bar = new ProgressBar(
                `:symbol ${step} [:bar] :current / :total`,
                {
                    total: length,
                    width: 20,
                    complete: '■',
                    incomplete: '─',
                    clear: true
                }
            )
            symbolTicking()
            interval = setInterval(symbolTicking, spinnerObj.interval)
        }
        bar.tick()
        completed++
    })
        // .then((/*isSuccess*/) => {
        //     waiting.stop()
        //     clearInterval(interval)
        //     spinner(step).finish()
        // })
        .catch(err =>
            waiting.fail(step + '\n  ' + (err.message || err))
        )

    if (bar) bar.terminate()
    if (waiting) waiting.stop()
    clearInterval(interval)

    if (completed < total) {
        spinner(step).fail(step + '\n  ' +
            `${total - completed} 项内容未下载成功`)
    } else {
        spinner(step).finish()
    }
}