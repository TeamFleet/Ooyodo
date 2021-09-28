const fs = require('fs-extra');
const path = require('path');
const Clpr = require('../clpr.cjs');

/**
 * 复制大量文件
 * @async
 * @param {Array} list
 * @param {String} name
 */
module.exports = async (list = [], name = 'Copying files') => {
    const progress = new Clpr(
        list.map((item) => {
            if (Array.isArray(item))
                return async () => {
                    const destDir = path.dirname(item[1]);
                    await fs.ensureDir(destDir);
                    await fs.copyFile(item[0], item[1]);
                };
        }),
        {
            name,
        }
    );
    // console.log(progress)
    await progress.start();
};
