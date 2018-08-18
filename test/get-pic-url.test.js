const request = require('request')
const getPicUrlShip = require('../libs/commons/get-pic-url-ship')
const getPicUrlEquipment = require('../libs/commons/get-pic-url-equipment')

const shipIds = [
    371, // 松風改
    321, // 大淀改
]
const shipPicTypes = [
    'full',
    'full_dmg',
    'supply_character',
    'supply_character_dmg',
    'remodel',
    'remodel_dmg',
    'banner',
    'banner_dmg',
    'card',
    'card_dmg',
]
const equipmentIds = [
    1,
    100,
]
const equipmentPicTypes = [
    'card',
    'card_t',
    'item_on',
]

const getStatusCode = async (url) => await new Promise(resolve => {
    request.get(
        url,
        {},
        (err, incomingMessage/*, response*/) => {
            if (incomingMessage.statusCode != 200)
                return resolve(incomingMessage.statusCode)
            if (err)
                return resolve(-1)
            return resolve(incomingMessage.statusCode)
        }
    )
})

describe('获取图片资源URL...', async () => {
    describe('舰娘图片...', async () => {
        for (let id of shipIds) {
            for (let type of shipPicTypes) {
                it(`[ ${id} | ${type} ] 可访问`, async () => {
                    const statusCode = await getStatusCode(getPicUrlShip(id, type))
                    // console.log(id, type, getPicUrlShip(id, type), statusCode)
                    expect(statusCode).toBe(200)
                })
            }
        }

        it(`[ 111111 | ${shipPicTypes[0]} ] 不可访问 (404)`, async () => {
            const statusCode = await getStatusCode(getPicUrlShip(111111, shipPicTypes[0]))
            expect(statusCode).toBe(404)
        })
    })
    describe('装备图片...', async () => {
        for (let id of equipmentIds) {
            for (let type of equipmentPicTypes) {
                it(`[ ${id} | ${type} ] 可访问`, async () => {
                    const statusCode = await getStatusCode(getPicUrlEquipment(id, type))
                    // console.log(id, type, getPicUrlShip(id, type), statusCode)
                    expect(statusCode).toBe(200)
                })
            }
        }

        it(`[ 111111 | ${equipmentPicTypes[0]} ] 不可访问 (404)`, async () => {
            const statusCode = await getStatusCode(getPicUrlEquipment(111111, equipmentPicTypes[0]))
            expect(statusCode).toBe(404)
        })
    })
})
