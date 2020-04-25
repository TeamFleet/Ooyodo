const fs = require('fs-extra');
const path = require('path');

const {
    pathname: { repoPics },
} = require('../../libs/vars');
const spinner = require('../../libs/commons/spinner');
const batch = require('./batch');
const getFolderGroup = require('./get-folder-group');

module.exports = async () => {
    const title = '舰娘限定';
    const waiting = spinner(title);

    const picsNames = {
        app: ['8.webp', '9.webp'],
        webApp: ['8.png', '8.webp', '9.png', '9.webp'],
        // pwa: [
        //     '8.png', '8.webp', '9.png', '9.webp',
        // ]
    };

    const folder = path.resolve(repoPics, 'dist/ships-extra');
    const list = [];

    const ids = (await fs.readdir(folder))
        .filter((filename) => {
            const stat = fs.lstatSync(path.resolve(folder, filename));
            return stat.isDirectory();
        })
        .map((filename) => parseInt(filename))
        .sort((a, b) => a - b);

    for (const id of ids) {
        const group = getFolderGroup(id);
        for (const type of Object.keys(picsNames)) {
            for (const filename of picsNames[type]) {
                list.push({
                    category: 'ships-extra',
                    type,
                    id,
                    filename,
                    group,
                });
            }
        }
    }

    waiting.stop();
    await batch(title, list);
};
