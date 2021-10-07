const chalk = require('chalk');

/**
 * 创建针对各个目标的发布版本
 * @async
 */
module.exports = async () => {
    console.log('');
    console.log(chalk.cyanBright('创建发布版本'));

    await require('./do-ships.cjs')();
    await require('./do-ships-extra.cjs')();
    await require('./do-equipments.cjs')();
    await require('./do-enemies.cjs')();
    await require('./do-entities.cjs')();
};
