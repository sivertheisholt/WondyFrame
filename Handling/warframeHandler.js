const Warframe = require('../api/warframe.js');
const warframe = new Warframe();

var methods = {
    getRelicInfo: function (tier, name) {
        return new Promise((resolve, reject) => {
            try {
                resolve(warframe.getData(`/data/relics/${tier}/${name}`));
                //resolve(returnFromApi)
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
    }
}

exports.data = methods;


