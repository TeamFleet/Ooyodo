const fs = require('fs-extra');
const path = require('path');

const {
    pathname: { repoPics },
} = require('../../libs/vars.cjs');
const spinner = require('../../libs/commons/spinner.cjs');
const batch = require('./batch.cjs');

module.exports = async () => {
    const title = '装备';
    const waiting = spinner(title);

    const picsNames = {
        app: ['card.webp'],
        webApp: ['card.png'],
        // pwa: [
        //     'card.png', 'card.webp',
        // ]
    };

    const folder = path.resolve(repoPics, 'dist/equipments');
    const list = [];

    const ids = (await fs.readdir(folder))
        .filter((filename) => {
            const stat = fs.lstatSync(path.resolve(folder, filename));
            return stat.isDirectory();
        })
        .map((filename) => parseInt(filename))
        .sort((a, b) => a - b);

    for (const id of ids) {
        for (const type of Object.keys(picsNames)) {
            if (!Array.isArray(picsNames[type])) continue;
            for (const filename of picsNames[type]) {
                list.push({
                    category: 'equipments',
                    type,
                    id: id,
                    filename,
                });
            }
        }
    }

    waiting.stop();
    await batch(title, list);
};
