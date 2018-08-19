const fs = require('fs-extra')
const path = require('path')

const spinner = require('../libs/commons/spinner')

const title = 'KC2 过渡期处理'

/**
 * KC2 过渡期处理
 * @async
 */
module.exports = async () => {
    const waiting = spinner(title)

    waiting.finish()
}
