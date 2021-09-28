const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const git = require('simple-git/promise');

const { pathname } = require('../vars.cjs');

module.exports = async () =>
    new Promise(async (resolve, reject) => {
        const dir = pathname.repoPics;

        const run = (command) =>
            new Promise((resolve, reject) => {
                // console.log(dir, command)
                exec(
                    command,
                    {
                        cwd: dir,
                        // shell: true,
                    },
                    (err /*, stdout, stderr*/) => {
                        if (err) return reject(err);
                        // console.log('stdout ', stdout)
                        // console.log('stderr ', stderr)
                        resolve();
                    }
                );
            }).catch((err) => reject(err));

        try {
            await run(`npm i --no-save`);
            await run(`npm start`);
        } catch (e) {
            reject(e);
        }

        {
            // 修改版本号
            const file = path.resolve(dir, 'package.json');
            const packageJSON = await fs.readFile(file, 'utf-8');
            await fs.writeFile(
                file,
                packageJSON.replace(/"version":([ ]*)"(.+?)"/, (match, p1) => {
                    const date = new Date();
                    return `"version":${p1}"${date.getFullYear()}.${(
                        date.getMonth() +
                        1 +
                        ''
                    ).padStart(2, '0')}.${(date.getDate() + '').padStart(
                        2,
                        '0'
                    )}"`;
                })
            );
        }

        // resolve()
        try {
            const repo = git(dir);
            await repo.add('./*');
            await repo.commit(`Ooyodo: ${new Date().toLocaleString()}`);
            await repo.push('origin', 'master');
        } catch (err) {
            reject(err);
        }

        resolve();
    });
