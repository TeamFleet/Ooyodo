const fs = require('fs-extra')
const path = require('path')

const spinner = require('../libs/commons/spinner')

const title = '过渡期处理'

/**
 * KC2 过渡期处理
 * @async
 */
module.exports = async () => {
    const waiting = spinner(title)

    /* 舰娘
        1. 依照 api_start2 的结果更新 db 的图鉴版本
        2. 复制 ships-extra 目录内容到 ships
            * 仅保留 0.png、10.png
        3. 遍历 ship_series
            a. 删除 1.png、2.png、3.png、11.png
            b. 如果为改造版本且存在 6.png、7.png，比对 6.png、7.png 和前一个版本是否相同
                * 如果相同，删除该文件夹内的 6.png、7.png，同时标记 db 内的相关字段
                * 如果不相同，移除 db 内的相关字段
    */

    /* 装备
        1. 仅保留 card.png
        2. 依照 api_start2 的结果更新 db 的图鉴版本
    */

    waiting.finish()
}
