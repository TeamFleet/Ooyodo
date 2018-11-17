const ProgressBar = require('progress')
const { dots } = require('cli-spinners')
const defaults = {}

class Clpr {
    constructor(...args) {
        this.init(...args)
    }

    /**
     * 初始化类
     * @param {*} args
     * @return {Object} this
     * @memberof Clpr
     */
    init(...args) {
        if (Array.isArray(args[0])) {
            const options = args[1] || {}
            options.promises = args[0]
            return this.init(options)
        }

        Object.assign(this, defaults, args[0])

        if (this.title && !this.name) {
            this.name = this.title
            delete this.title
        }

        this.total = this.promises.length
        this.currentSpinnerFrame = 0
        this.failed = []

        this.bar = new ProgressBar(
            `:symbol ${this.name} [:bar] :current / :total`,
            {
                total: this.total,
                width: 20,
                complete: '■',
                incomplete: '─',
                clear: true,
                symbol: this.getSymbol()
            }
        )

        return this
    }

    async start() {
        this.intervalSpinner = setInterval(this.tickSpinner.bind(this), dots.interval)

        for (let promise of this.promises) {
            await promise().catch(err => this.failed.push(err))
            await new Promise(resolve => setTimeout(resolve, 5))
            this.bar.tick()
        }

        clearInterval(this.intervalSpinner)
        this.bar.terminate()

        if (this.failed.length) {
            console.log(
                '\x1b[31m' + '×' + '\x1b[0m'
                + ' '
                + this.name
                + ` (失败: ${this.failed.length})`
            )
            this.failed.forEach(err => {
                console.log(' ')
                console.error(err)
            })
        } else {
            console.log(
                '\x1b[32m' + '√' + '\x1b[0m'
                + ' '
                + this.name
            )
        }
    }

    /**
     * 获取进度条属性: symbol
     * @memberof Clpr
     * @returns {String}
     */
    getSymbol() {
        return '\x1b[36m' + dots.frames[this.currentSpinnerFrame] + '\x1b[0m'
    }

    tickSpinner() {
        this.currentSpinnerFrame++
        if (this.currentSpinnerFrame > dots.frames.length - 1)
            this.currentSpinnerFrame = 0
        this.bar.tick(0, {
            symbol: this.getSymbol()
        })
    }
}

module.exports = Clpr
