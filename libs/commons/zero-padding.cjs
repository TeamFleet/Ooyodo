module.exports = (number, padding) => {
    number = '' + parseInt(number)
    return number.padStart(padding, '0')
}
