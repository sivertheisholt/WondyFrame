'use strict';

const Warframe = require('../api/warframe.js.js');
const warframe = new Warframe();

var methods = {
    getRelicInfo: function (tier, name, itemName) {
        return warframe.getData(`/data/relics/${tier}/${name}`, itemName);
    },
    getMissionRewards: function() {
        return warframe.getData(`/data/missionRewards.json`);
    },
    getAllRelicInfo: function() {
        return warframe.getData(`/data/relics.json`);
    },
    getCetusBountyRewards: function() {
        return warframe.getData(`/data/cetusBountyRewards.json`);
    },
    getFortunaBountyRewards: function() {
        return warframe.getData(`/data/solarisBountyRewards.json`);
    },
    getDeimosBountyRewards: function() {
        return warframe.getData(`/data/deimosRewards.json`)
    },
    getEnemyBlueprintDrops: function() {
        return warframe.getData(`/data/enemyBlueprintTables.json`);
    },
    getTransientRewards: function() {
        return warframe.getData(`/data/transientRewards.json`);
    },
    getEnemyModDrops: function() {
        return warframe.getData(`/data/enemyModTables.json`);
    },
    getMiscDrops: function() {
        return warframe.getData(`/data/miscItems.json`);
    },
    getSortieRewards: function() {
        return warframe.getData(`/data/sortieRewards.json`);
    },
    getBuildInfo: function() {
        return warframe.getData(`/data/info.json`);
    },
    getWorldState: function() {
        return warframe.getWorldState();
    }
}

exports.data = methods;





