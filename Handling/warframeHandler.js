const Warframe = require('../api/warframe.js');
const warframe = new Warframe();

var methods = {
    getRelicInfo: async function (tier, name, itemName) {
        return await warframe.getData(`/data/relics/${tier}/${name}`, itemName);
    },
    getMissionRewards: async function() {
        return await warframe.getData(`/data/missionRewards.json`);
    },
    getAllRelicInfo: async function() {
        return await warframe.getData(`/data/relics.json`);
    },
    getCetusBountyRewards: async function() {
        return await warframe.getData(`/data/cetusBountyRewards.json`);
    },
    getFortunaBountyRewards: async function() {
        return await warframe.getData(`/data/solarisBountyRewards.json`);
    },
    getDeimosBountyRewards: async function() {
        return await warframe.getData(`/data/deimosRewards.json`)
    },
    getEnemyBlueprintDrops: async function() {
        return await warframe.getData(`/data/enemyBlueprintTables.json`);
    },
    getTransientRewards: async function() {
        return await warframe.getData(`/data/transientRewards.json`);
    },
    getEnemyModDrops: async function() {
        return await warframe.getData(`/data/enemyModTables.json`);
    },
    getMiscDrops: async function() {
        return await warframe.getData(`/data/miscItems.json`);
    },
    getSortieRewards: async function() {
        return await warframe.getData(`/data/sortieRewards.json`);
    },
    getBuildInfo: async function() {
        return await warframe.getData(`/data/info.json`);
    },
    getWorldState: async function() {
        return await warframe.getWorldState();
    }
}

exports.data = methods;





