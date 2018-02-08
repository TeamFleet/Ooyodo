#!/usr/bin/env node
const argv = require('yargs').argv
const fs = require('fs-extra')
const path = require('path')

const vars = require('./libs/vars')
const spinner = require('./libs/commons/spinner')

const strPaddingLength = 50
const strPaddingStr = '─'

const run = async () => {
    let token, dir
    const files = {}

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
        dir = path.join(__dirname, vars.pathFetchedData)
        fs.ensureDirSync(dir)

        files.apiStart2 = path.resolve(dir, `api_start2.json`)
    }

    /************************************************
     * 如果提供了token，获取游戏API - start2
     ***********************************************/
    if (token) {
        console.log(`√ Token: ${token}`)

        const step = '获取游戏API - start2'
        const run = require('./libs/fetch-gameapi/start2')
        const waiting = spinner(step)

        await run({
            token
        })
            .then(data => {
                fs.writeFileSync(
                    path.join(files.apiStart2),
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
    if (!fs.existsSync(files.apiStart2)) {
        console.log('❌  Aborted! '.padEnd(strPaddingLength, strPaddingStr))
        console.log('')

        if (!token) {
            console.log('Please type valid command:')
            console.log('npm start -- [token]')
        } else {
            console.log('api_start2 fetch error!')
        }

        console.log('')
        console.log(''.padEnd(strPaddingLength, strPaddingStr))
        return
    }

    /************************************************
     * 准备pics和database代码库
     ***********************************************/
    {

    }

    /************************************************
     * 下载舰娘图片
     ***********************************************/
    {

    }

    /************************************************
     * 下载装备图片
     ***********************************************/
    {
        
    }

    /************************************************
     * 初始化database
     ***********************************************/
    {
        
    }

    /************************************************
     * 比对所有舰娘图片和已有图片，选择出新的图片
     ***********************************************/
    {
        
    }

    /************************************************
     * 复制所有新图片到pics代码库
     ***********************************************/
    {
        
    }

    /************************************************
     * 更新database
     ***********************************************/
    {
        
    }

    console.log(`√ Finished!`)
    console.log('')
    console.log(''.padEnd(strPaddingLength, strPaddingStr))
}

run()