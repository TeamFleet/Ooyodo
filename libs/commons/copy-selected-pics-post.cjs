const fs = require('fs-extra');
const path = require('path');
const ncp = require('ncp').ncp;

const { pathname } = require('../vars.cjs');

ncp.limit = 16;

const copy = async (obj) => {
    let from, to, id;
    if (obj.shipExIllust) {
        id = obj.id;
        from = path.resolve(pathname.repoPics, `./dist/ships-extra/${id}`);
        to = path.resolve(pathname.newPics, `./ships-extra/${id}`);
    } else if (obj.ship) {
        id = typeof obj.ship === 'object' ? obj.ship.id : obj.id;
        from = path.resolve(pathname.repoPics, `./dist/ships/${id}`);
        to = path.resolve(pathname.newPics, `./ships/${id}`);
    } else if (obj.equipment) {
        id = typeof obj.equipment === 'object' ? obj.equipment.id : obj.id;
        from = path.resolve(pathname.repoPics, `./dist/equipments/${id}`);
        to = path.resolve(pathname.newPics, `./equipments/${id}`);
    }

    // console.log(
    //     from, to
    // )
    await fs.ensureDir(to);
    await fs.copy(from, to);
};

module.exports = async (list) =>
    new Promise(async (resolve, reject) => {
        await fs.ensureDir(pathname.newPics);
        await fs.emptyDir(pathname.newPics);

        for (const obj of list) {
            try {
                await copy(obj);
            } catch (err) {
                reject(err);
            }
        }
        resolve();
    });
