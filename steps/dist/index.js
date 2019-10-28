const chalk = require('chalk');

/**
 * 创建针对各个目标的发布版本
 * @async
 */
module.exports = async () => {
    console.log('');
    console.log(chalk.cyanBright('创建发布版本'));

    await require('./do-ships')();
    await require('./do-ships-extra')();
    await require('./do-equipments')();
    await require('./do-enemies')();
    await require('./do-entities')();
};
