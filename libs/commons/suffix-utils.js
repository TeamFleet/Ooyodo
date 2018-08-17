
const resource = [6657, 5699, 3371, 8909, 7719, 6229, 5449, 8561, 2987, 5501, 3127, 9319, 4365, 9811, 9927, 2423, 3439, 1865, 5925, 4409, 5509, 1517, 9695, 9255, 5325, 3691, 5519, 6949, 5607, 9539, 4133, 7795, 5465, 2659, 6381, 6875, 4019, 9195, 5645, 2887, 1213, 1815, 8671, 3015, 3147, 2991, 7977, 7045, 1619, 7909, 4451, 6573, 4545, 8251, 5983, 2849, 7249, 7449, 9477, 5963, 2711, 9019, 7375, 2201, 5631, 4893, 7653, 3719, 8819, 5839, 1853, 9843, 9119, 7023, 5681, 2345, 9873, 6349, 9315, 3795, 9737, 4633, 4173, 7549, 7171, 6147, 4723, 5039, 2723, 7815, 6201, 5999, 5339, 4431, 2911, 4435, 3611, 4423, 9517, 3243]
const utils = {
    create: (id, type) => {
        const idStr = id.toString().match(/\d+/);
        if (idStr == null || idStr.length == 0)
            return ""

        const r = parseInt(idStr[0])
        const s = utils.createKey(type)
        const a = null == type || 0 == type.length ? 1 : type.length
        return (17 * (r + 7) * resource[(s + r * a) % 100] % 8973 + 1e3).toString()
    },
    createKey: (type) => {
        let e = 0
        if (null != type && "" != type)
            for (let i = 0; i < type.length; i++)
                e += type.charCodeAt(i)
        return e
    }
}

module.exports = utils
