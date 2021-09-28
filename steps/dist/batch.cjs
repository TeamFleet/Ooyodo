const fs = require('fs-extra');
const path = require('path');
const copyFiles = require('../../libs/commons/copy-files.cjs');

const dirs = require('./dirs.cjs');
const {
    pathname: { repoPics },
} = require('../../libs/vars.cjs');

const getFolder = (type, category, id, group) => {
    switch (type) {
        case 'app': {
            group = group ? `-${group}` : '';
            if (category === 'equipments')
                return path.resolve(dirs[type], `pics/items${group}`, '' + id);
            return path.resolve(
                dirs[type],
                `pics-${category}${group}`,
                '' + id
            );
        }
        case 'webApp': {
            if (category === 'equipments')
                return path.resolve(dirs[type], `pics/items`, '' + id);
            if (category === 'entities')
                return path.resolve(dirs[type], `pics/entities`, '' + id);
            return path.resolve(dirs[type], `pics-${category}`, '' + id);
        }
        // case 'pwa': {
        //     return path.resolve(dirs[type], `${category}`, '' + id)
        // }
    }
    return path.resolve(dirs[type], `${category}`, '' + id);
};

module.exports = async (title, list = []) => {
    const pairs = [];

    list.forEach((o) => {
        const { category, type, id, filename, group } = o;
        const from = path.resolve(
            repoPics,
            'dist',
            category,
            '' + id,
            '' + filename
        );

        if (!fs.existsSync(from)) return;

        const to = getFolder(type, category, id, group);
        const dest = path.resolve(to, filename);

        pairs.push([from, dest]);
    });

    await copyFiles(pairs, title);
};
