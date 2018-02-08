const ora = require('ora')

module.exports = (options = {}) => {
    const waiting = ora(
        Object.assign(
            {
                spinner: 'dots',
                color: 'cyan'
            },
            typeof options === 'string' ? {
                text: options
            } : options
        )
    ).start()

    waiting.finish = (options = {}) => {
        waiting.color = 'green'
        waiting.stopAndPersist(Object.assign({
            symbol: '√'
        }, options))
    }

    return waiting
}