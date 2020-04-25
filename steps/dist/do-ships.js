const createDatastore = require('../../libs/commons/create-datastore');
const spinner = require('../../libs/commons/spinner');
const batch = require('./batch');
const getFolderGroup = require('./get-folder-group');

module.exports = async () => {
    const title = '舰娘';
    const waiting = spinner(title);

    const picsNames = {
        app: ['0.webp', '8.webp', '9.webp', '10.webp'],
        webApp: [
            '0.png',
            '0.webp',
            '0-1.png',
            '0-2.png',
            '2.png',
            '8.png',
            '8.webp',
            '9.png',
            '9.webp',
            '10.png',
            '10.webp',
        ],
        // pwa: [
        //     '0.png',
        //     '0.webp',
        //     '0-1.png',
        //     '0-1.webp',
        //     '0-2.png',
        //     '0-2.webp',
        //     '8.png',
        //     '8.webp',
        //     '9.png',
        //     '9.webp',
        //     '10.png',
        //     '10.webp',
        //     'special.png',
        //     'special.webp'
        // ]
    };
    const sameAsPrevPicIdsIgnore = [8, 9, 10, 11, 'special'];

    const db = await createDatastore();
    const allSeries = (await db.shipSeries.find({})).sort(
        (a, b) => parseInt(a.id) - parseInt(b.id)
    );
    // const count = allSeries.reduce((prev, current) => (
    //     prev + current.ships.length
    // ), 0)
    const list = [];

    for (const series of allSeries) {
        for (const ship of series.ships) {
            const sameAsPrev = ship.illust_delete ? true : false;
            const id = ship.id;
            const group = getFolderGroup(id);
            for (const type of Object.keys(picsNames)) {
                for (const filename of picsNames[type]) {
                    if (
                        sameAsPrev &&
                        sameAsPrevPicIdsIgnore.some((id) =>
                            filename.includes(`${id}.`)
                        )
                    )
                        continue;
                    list.push({
                        category: 'ships',
                        type,
                        id,
                        filename,
                        group,
                    });
                }
            }
        }
    }

    waiting.stop();
    await batch(title, list);
};
