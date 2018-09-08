module.exports = (id) => {
    let index = 100
    let multiplier = 1
    while (index * multiplier < id) {
        multiplier++
    }
    return multiplier
}