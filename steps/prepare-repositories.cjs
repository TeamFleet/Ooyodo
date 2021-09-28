const spinner = require('../libs/commons/spinner.cjs');

const step = '准备代码库';
const run = async (type, args) => {
    const thisStep = step + ` (${type})`;
    const waiting = spinner(thisStep);
    return require('../libs/commons/prepare-repo-dir.cjs')(
        type,
        undefined,
        args
    )
        .then(() => waiting.finish())
        .catch((err) => waiting.fail(thisStep + '\n  ' + (err.message || err)));
};

/**
 * 准备代码库：pics、database
 * @async
 */
module.exports = async () => {
    await run('database');
    await run('pics', ['--depth', '1']);
};
