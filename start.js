#!/usr/bin/env node
const argv = require('yargs').argv
const fs = require('fs-extra')
const path = require('path')

const {
    pathname,
} = require('./libs/vars')
const spinner = require('./libs/commons/spinner')
const download = require('./libs/commons/download')

const strPaddingLength = 50
const strPaddingStr = '─'

const logWIP = str => console.log('\x1b[31m' + '× \x1b[91m[WIP] \x1b[0m' + str)

const run = async () => {
    let token
    let newpics = []

    { // 确定访问DMM的token
        if (argv.token)
            token = argv.token
        else if (Array.isArray(argv._) && argv._.length) {
            token = argv._[0] + ''
            if (token.substr(0, 6) == 'token=' ||
                token.substr(0, 6) == 'token:')
                token = token.substr(6)
        }
    }

    console.log(''.padEnd(strPaddingLength, strPaddingStr))
    console.log('')

    /************************************************
     * 确保内容存储目录和相关文件路径
     ***********************************************/
    {
        fs.ensureDirSync(pathname.fetchedData)
    }

    /************************************************
     * 如果提供了token，获取游戏API - start2
     ***********************************************/
    if (token) {
        console.log(`\x1b[32m√\x1b[0m Token: ${token}`)

        const step = '获取游戏API - start2'
        const waiting = spinner(step)
        const run = require('./libs/fetch-gameapi/start2')

        await run({
            token
        })
            .then(data => {
                fs.writeFileSync(
                    path.join(pathname.apiStart2),
                    JSON.stringify(data, undefined, 4)
                )
                waiting.finish()
                // console.log(data)
            })
            .catch(err => {
                let msg = ''
                if (err && err.message) {
                    msg = err.message
                } else if (err.api_result_msg) {
                    if (err.api_result) {
                        msg = `[${err.api_result}] ${err.api_result_msg}`
                    } else
                        msg = err.api_result_msg
                }
                waiting.fail(step + '\n  ' + msg)
            })
    }

    /************************************************
     * 检查api_start2.json
     ***********************************************/
    if (!fs.existsSync(pathname.apiStart2)) {
        console.log('❌  终止! '.padEnd(strPaddingLength, strPaddingStr))
        console.log('')

        if (!token) {
            console.log('请输入正确的命令')
            console.log('npm start -- [token]')
        } else {
            console.log('获取 api_start2 发生错误!')
        }

        console.log('')
        console.log(''.padEnd(strPaddingLength, strPaddingStr))
        return
    }

    /************************************************
     * 准备pics和database代码库
     ***********************************************/
    {
        const step = '准备代码库'

        const run = async type => {
            const thisStep = step + ` (${type})`
            const waiting = spinner(thisStep)
            return require('./libs/commons/prepare-repo-dir')(type)
                .then(() => waiting.finish())
                .catch(err =>
                    waiting.fail(thisStep + '\n  ' + (err.message || err))
                )
        }

        await run('database')
        await run('pics')
    }

    /************************************************
     * 下载舰娘图片
     ***********************************************/
    {
        try {
            await download(
                '下载舰娘图片',
                require('./libs/fetch-pics/ships')
            )
        } catch (err) {
            console.log(err)
            throw err
        }
    }

    /************************************************
     * 下载装备图片
     ***********************************************/
    {
        await download(
            '下载装备图片',
            require('./libs/fetch-pics/equipments')
        )
    }

    /************************************************
     * 初始化database
     ***********************************************/
    {
        const step = '初始化database'
        const waiting = spinner(step)
        const run = require('./libs/commons/init-db')
        await run()
            .then(() => waiting.finish())
            .catch(err =>
                waiting.fail(step + '\n  ' + (err.message || err))
            )
        // const {
        //     db,
        // } = require('./libs/vars')
        // console.log(db)
    }

    /************************************************
     * 查找新的舰娘图片
     ***********************************************/
    {
        const step = '查找新的舰娘图片'
        const waiting = spinner(step)
        const run = require('./libs/select-pics/ships')
        await run()
            .then(newlist => {
                if (Array.isArray(newlist) && newlist.length) {
                    waiting.finish()
                    newpics = newpics.concat(newlist)
                    console.log(
                        newlist.map(obj => {
                            let msg = '  \x1b[92m' + '✦ NEW!✦ ' + '\x1b[0m'
                                + (obj.id + '').padStart(3, ' ')
                                + ' - '

                            if (typeof obj.ship === 'object') {
                                if (obj.ship.id == obj.id) {
                                    msg += obj.ship._name
                                } else {
                                    msg += `[${obj.ship.id}] ${obj.ship._name}`
                                }
                            } else if (obj.ship === true) {
                                msg += '新舰娘'
                            } else if (typeof obj.ship === 'string') {
                                msg += obj.ship
                            }

                            return msg
                        }).join('\n')
                    )
                } else {
                    waiting.finish(step + ': 无新图')
                }
            })
            .catch(err =>
                waiting.fail(step + '\n  ' + (err.message || err))
            )
    }

    /************************************************
     * 查找新的装备图片
     ***********************************************/
    {
        const step = '查找新的装备图片'
        const waiting = spinner(step)
        const run = require('./libs/select-pics/equipments')
        await run(newpics)
            .then(newlist => {
                if (Array.isArray(newlist) && newlist.length) {
                    waiting.finish()
                    newpics = newpics.concat(newlist)
                    console.log(
                        newlist.map(obj => {
                            let msg = '  \x1b[92m' + '✦ NEW!✦ ' + '\x1b[0m'
                                + (obj.id + '').padStart(3, ' ')
                                + ' - '
                            if (obj.equipment === true) {
                                msg += '新装备'
                            } else if (typeof obj.equipment === 'string') {
                                msg += obj.equipment
                            }
                            return msg
                        }).join('\n')
                    )
                } else {
                    waiting.finish(step + ': 无新图')
                }
            })
            .catch(err =>
                waiting.fail(step + '\n  ' + (err.message || err))
            )
    }

    /************************************************
     * 复制新的图片
     ***********************************************/
    if (Array.isArray(newpics) && newpics.length) {
        // logWIP('复制新的图片')
        const step = '复制新的图片'
        const waiting = spinner(step)
        const run = require('./libs/commons/copy-selected-pics')
        await run(newpics)
            .then(() => waiting.finish())
            .catch(err =>
                waiting.fail(step + '\n  ' + (err.message || err))
            )
    }

    /************************************************
     * 操作pics代码库
     ***********************************************/
    if (Array.isArray(newpics) && newpics.length) {
        // logWIP('操作pics代码库')
        const step = '操作pics代码库'
        const waiting = spinner(step)
        const run = require('./libs/commons/process-repo-pics')
        await run(newpics)
            .then(() => waiting.finish())
            .catch(err =>
                waiting.fail(step + '\n  ' + (err.message || err))
            )
    }

    /************************************************
     * 复制处理完毕的新图片
     ***********************************************/
    if (Array.isArray(newpics) && newpics.length) {
        // logWIP('复制新的图片')
        const step = '复制处理完毕的新图片'
        const waiting = spinner(step)
        const run = require('./libs/commons/copy-selected-pics-post')
        await run(newpics)
            .then(() => waiting.finish())
            .catch(err =>
                waiting.fail(step + '\n  ' + (err.message || err))
            )
    }

    /************************************************
     * 更新database
     ***********************************************/
    {
        logWIP('更新database')
    }

    console.log('')
    console.log('\x1b[36m' + '完成!' + '\x1b[0m')
    console.log('')
    console.log(''.padEnd(strPaddingLength, strPaddingStr))
}

run()
