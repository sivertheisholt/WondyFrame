const Warframe = require('../api/warframe.js');
const warframe = new Warframe();

var methods = {
    getRelicInfo: function (tier, name) {
        return new Promise((resolve, reject) => {
            try {
                resolve(warframe.getData(`/data/relics/${tier}/${name}`));
            } catch (err) {
                reject(err);
            }
        });
    },
    getMissionRewards: function() {
        return new Promise((resolve, reject) => {
            try {
                resolve(warframe.getData(`/data/missionRewards.json`));
            } catch (err) {
                reject(err);
            }
        })
    },
    getAllRelicInfo: function() {
        return new Promise((resolve, reject) => {
            try {
                resolve(warframe.getData(`/data/relics.json`));
            } catch (err) {
                reject(err);
            }
        })
    },
    getCetusBountyRewards: function() {
        return new Promise((resolve, reject) => {
            try {
                resolve(warframe.getData(`/data/cetusBountyRewards.json`));
            } catch (err) {
                reject(err);
            }
        })
    },
    getFortunaBountyRewards: function() {
        return new Promise((resolve, reject) => {
            try {
                resolve(warframe.getData(`/data/solarisBountyRewards.json`));
            } catch (err) {
                reject(err);
            }
        })
    },
    getDeimosBountyRewards: function() {
        return new Promise((resolve, reject) => {
            try {
                resolve(warframe.getData(`/data/deimosRewards.json`));
            } catch (err) {
                reject(err);
            }
        })
    },
    getEnemyBlueprintDrops: function() {
        return new Promise((resolve, reject) => {
            try {
                resolve(warframe.getData(`/data/enemyBlueprintTables.json`));
            } catch (err) {
                reject(err);
            }
        })
    },
    getBuildInfo: function() {
        return new Promise((resolve, reject) => {
            try {
                resolve(warframe.getData(`/data/info.json`));
            } catch (err) {
                reject(err);
            }
        })
    }
}

exports.data = methods;


