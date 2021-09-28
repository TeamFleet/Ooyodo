const fs = require('fs-extra');
const path = require('path');
const git = require('simple-git/promise');
const debug = require('debug');

const { pathname } = require('../vars.cjs');

const repos = {
    pics: 'git@github.com:TeamFleet/WhoCallsTheFleet-Pics.git',
    database: 'git@github.com:TeamFleet/WhoCallsTheFleet-DB.git',
    akigumo: 'git@github.com:TeamFleet/Akigumo.git',
};

module.exports = async (type, dest, args) =>
    new Promise(async (resolve, reject) => {
        // 确保repo目录
        // 如果存在，检查是否为repo
        // 如果不为repo，清空目录
        // 如果不存在或不为repo，执行clone
        if (type === 'db') type = 'database';

        if (!(type in repos))
            return reject(new Error('请输入正确的代码库类型'));

        const dir =
            dest ||
            pathname[`repo` + type.substr(0, 1).toUpperCase() + type.substr(1)];
        const repoURL = repos[type];

        let exist = fs.existsSync(dir);

        if (fs.existsSync(dir) && !fs.lstatSync(dir).isDirectory()) {
            fs.removeSync(dir);
            exist = false;
        }

        // console.log({
        //     dir,
        //     dest,
        //     type,
        //     pathname,
        //     typeName: `repo` + type.substr(0, 1).toUpperCase() + type.substr(1),
        // });
        fs.ensureDirSync(dir);

        const isRepo =
            (await git(dir).checkIsRepo()) &&
            fs.existsSync(path.resolve(dir, '.git'));

        if (!isRepo) await fs.emptyDir(dir);

        if (!isRepo || !exist) {
            try {
                const thisArgs = Array.isArray(args)
                    ? ['--single-branch', ...args]
                    : { '--single-branch': true, ...(args || {}) };
                if (!Array.isArray(thisArgs)) {
                    for (const [key, value] of Object.entries(thisArgs)) {
                        if (!/^--/.test(key)) {
                            thisArgs[`--${key}`] = value;
                            delete thisArgs[key];
                        }
                    }
                }
                await git().clone(repoURL, dir, thisArgs);
            } catch (err) {
                return reject(err);
            }
        }

        const thisGit = git(dir);

        /** @type {Boolean} 是否有 git repo 操作权限 */
        const hasGitAccess = await (async () => {
            let err;

            // thisGit.silent(true);
            debug.disable();

            await thisGit.push('origin', 'master').catch((e) => {
                err = e;
            });

            debug.enable();
            // thisGit.silent(false);

            if (err instanceof Error) err = err.message;
            if (typeof err === 'string')
                return !/permission.+denied/i.test(err);

            return true;
        })();

        // * 如果没有权限，报错
        if (!hasGitAccess) {
            return reject(new Error('No permission for git repo'));
        }

        try {
            // * 重置所有提交
            // await thisGit.reset('hard');
            // await thisGit.clean('f');
            // * 拉取代码
            await thisGit.pull();
        } catch (err) {
            return reject(err);
        }

        return resolve();
    });
