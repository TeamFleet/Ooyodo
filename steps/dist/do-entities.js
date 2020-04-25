const fs = require('fs-extra');
const path = require('path');

const {
    pathname: { repoPics },
} = require('../../libs/vars');
const spinner = require('../../libs/commons/spinner');
const batch = require('./batch');

module.exports = async () => {
    const title = '声优';
    const waiting = spinner(title);

    const picsNames = {
        app: false,
        webApp: ['0.png', '0-1.png', '0-2.png', '2.jpg'],
        // pwa: [
        //     '0.png', '0.webp', '0-1.png', '0-1.webp', '0-2.png', '0-2.webp',
        //     '2.jpg',
        // ]
    };

    const folder = path.resolve(repoPics, 'dist/entities');
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
                    category: 'entities',
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
