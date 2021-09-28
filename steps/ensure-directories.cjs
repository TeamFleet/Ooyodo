const fs = require('fs-extra');
const { pathname } = require('../libs/vars.cjs');

/**
 * 确保内容存储目录和相关文件路径
 * @async
 */
module.exports = async () => {
    await fs.ensureDir(pathname.fetchedData);
};
