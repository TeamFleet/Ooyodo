#!/usr/bin/env node
const argv = require('yargs').argv;
const chalk = require('chalk');

// const spinner = require('./libs/commons/spinner');
const { strPaddingLength, strPaddingStr } = require('./libs/vars');

const isKC2Transition = true;

// const logWIP = str => console.log('\x1b[31m' + '× \x1b[91m[WIP] \x1b[0m' + str);

const run = async () => {
    let isOnlyDownload = false;
    let isDist = false;
    let isDistHash = false;
    const argvs = Array.isArray(argv._)
        ? argv._.filter(arg => {
              if (arg === 'only-download') {
                  isOnlyDownload = true;
                  return false;
              }
              if (arg === 'dist') {
                  isDist = true;
                  return false;
              }
              if (arg === 'dist-hash') {
                  isDistHash = true;
                  return false;
              }
              return true;
          })
        : [];

    console.log(''.padEnd(strPaddingLength, strPaddingStr));
    console.log('');
    console.log(chalk.cyanBright('Ooyodo'));
    console.log('');

    await (async () => {
        if (isDist) {
            await require('./steps/dist')();
            return;
        }

        const token = await require('./steps/get-token')(argvs);
        await require('./steps/ensure-directories')();
        await require('./steps/fetch-api-start2')(token);

        if (!isOnlyDownload) {
            await require('./steps/prepare-repositories')();
        }

        if (isDistHash) {
            console.log(' ');
            await require('./steps/dist-hash')();
            return;
        }

        const versionsShipsOld = await require('./steps/get-versions-ships')();
        await require('./steps/download-pics-ships')();
        await require('./steps/download-pics-equipments')();

        if (!token) {
            await require('./steps/initialize-database')();
            await require('./steps/select-pics-ships')(versionsShipsOld);

            if (!isOnlyDownload) {
                if (isKC2Transition) {
                    await require('./steps/kc2-transition')();
                }
            }
        }

        return;
    })();

    console.log('');
    console.log(chalk.greenBright('完成'));
    console.log('');
    console.log(''.padEnd(strPaddingLength, strPaddingStr));

    return;

    /************************************************
     * 查找新的装备图片
     ***********************************************/
    // {
    //     const step = '查找新的装备图片';
    //     const waiting = spinner(step);
    //     const run = require('./libs/select-pics/equipments');
    //     await run(newpics)
    //         .then(newlist => {
    //             if (Array.isArray(newlist) && newlist.length) {
    //                 waiting.finish();
    //                 newpics = newpics.concat(newlist);
    //                 console.log(
    //                     newlist
    //                         .map(obj => {
    //                             let msg =
    //                                 '  \x1b[92m' +
    //                                 '✦ NEW!✦ ' +
    //                                 '\x1b[0m' +
    //                                 (obj.id + '').padStart(3, ' ') +
    //                                 ' - ';
    //                             if (obj.equipment === true) {
    //                                 msg += '新装备';
    //                             } else if (typeof obj.equipment === 'string') {
    //                                 msg += obj.equipment;
    //                             }
    //                             return msg;
    //                         })
    //                         .join('\n')
    //                 );
    //             } else {
    //                 waiting.finish(step + ': 无新图');
    //             }
    //         })
    //         .catch(err => waiting.fail(step + '\n  ' + (err.message || err)));
    // }

    /************************************************
     * 复制新的图片
     ***********************************************/
    // if (Array.isArray(newpics) && newpics.length) {
    //     // logWIP('复制新的图片')
    //     const step = '复制新的图片';
    //     const waiting = spinner(step);
    //     const run = require('./libs/commons/copy-selected-pics');
    //     await run(newpics)
    //         .then(() => waiting.finish())
    //         .catch(err => waiting.fail(step + '\n  ' + (err.message || err)));
    // }

    /************************************************
     * 操作pics代码库
     ***********************************************/
    // if (Array.isArray(newpics) && newpics.length) {
    //     // logWIP('操作pics代码库')
    //     const step = '操作pics代码库';
    //     const waiting = spinner(step);
    //     const run = require('./libs/commons/process-repo-pics');
    //     await run(newpics)
    //         .then(() => waiting.finish())
    //         .catch(err => waiting.fail(step + '\n  ' + (err.message || err)));
    // }

    /************************************************
     * 复制处理完毕的新图片
     ***********************************************/
    // if (Array.isArray(newpics) && newpics.length) {
    //     // logWIP('复制新的图片')
    //     const step = '复制处理完毕的新图片';
    //     const waiting = spinner(step);
    //     const run = require('./libs/commons/copy-selected-pics-post');
    //     await run(newpics)
    //         .then(() => waiting.finish())
    //         .catch(err => waiting.fail(step + '\n  ' + (err.message || err)));
    // }

    /************************************************
     * 更新database
     ***********************************************/
    // {
    //     logWIP('更新database');
    // }
};

run();
