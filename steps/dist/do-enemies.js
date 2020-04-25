const fs = require('fs-extra');
const path = require('path');

const {
    pathname: { repoPics },
} = require('../../libs/vars');
const spinner = require('../../libs/commons/spinner');
const batch = require('./batch');

module.exports = async () => {
    const title = '敌舰';
    const waiting = spinner(title);

    const picsNames = {
        app: false,
        webApp: false,
        // pwa: [
        //     '0.png',// '0.webp',
        //     '8.png',// '8.webp',
        // ]
    };

    const folder = path.resolve(repoPics, 'dist/enemies');
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
                    category: 'enemies',
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
