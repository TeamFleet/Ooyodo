const fs = require('fs-extra');
const { pathname } = require('../libs/vars.cjs');

const filePicsVersions = pathname.fetched.versions.ships;

module.exports = async () => {
    if (!fs.existsSync(filePicsVersions)) {
        await fs.writeJson(filePicsVersions, {});
        return {};
    }

    return await fs.readJson(filePicsVersions);
};
