/**
 * 等待 n 毫秒
 * @async
 * @param {Number} timeMS 毫秒
 * @returns {Promise}
 */
module.exports = async (timeMS = 0) => new Promise(resolve => {
    setTimeout(resolve, timeMS)
})
