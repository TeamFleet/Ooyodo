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
        waiting.stopAndPersist(Object.assign({
            symbol: '\x1b[32m' + '√' + '\x1b[0m'
        }, options))
        // waiting.color = 'green'
    }

    return waiting
}