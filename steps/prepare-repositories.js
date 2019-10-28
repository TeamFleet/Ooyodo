const spinner = require('../libs/commons/spinner');

const step = '准备代码库';
const run = async type => {
    const thisStep = step + ` (${type})`;
    const waiting = spinner(thisStep);
    return require('../libs/commons/prepare-repo-dir')(type)
        .then(() => waiting.finish())
        .catch(err => waiting.fail(thisStep + '\n  ' + (err.message || err)));
};

/**
 * 准备代码库：pics、database
 * @async
 */
module.exports = async () => {
    await run('database');
    await run('pics');
};
