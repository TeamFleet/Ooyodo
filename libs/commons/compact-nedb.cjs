module.exports = async dataStores => {
    for (const store of Object.values(dataStores)) {
        store.nedb.persistence.compactDatafile();
        await new Promise(resolve => {
            setTimeout(() => resolve(), 500);
        });
    }
};
