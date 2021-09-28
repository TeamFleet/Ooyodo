module.exports = (id) => {
    let groupCountMax = 50
    let currentGroupNumber = 1
    while (groupCountMax * currentGroupNumber < id) {
        currentGroupNumber++
    }
    return currentGroupNumber
}
