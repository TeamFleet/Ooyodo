const chalk = require('chalk');

/**
 * 输入日志: 子标题
 */
module.exports = (msg, level = 2) => {
    const func = {
        2: chalk.redBright.underline,
        3: chalk.magentaBright.italic
    };
    // console.log(chalk.magentaBright.underline(msg));
    console.log(func[level](msg));
};
