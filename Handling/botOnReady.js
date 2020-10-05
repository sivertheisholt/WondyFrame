const warframe = require('../Handling/warframeHandler');
var methods = {
    sortData: async function (t) {
        return new Promise((resolve, reject) => {
                        const map = new Map()
                        const addRewards = (planet, node, rotation, rewards, gameMode) => {
                            for (const reward of rewards) {
                                let r = map.get(reward.itemName)
                                if (!r) {
                                    r = []
                                    map.set(reward.itemName, r)
                                }
                                r.push({ gameMode, planet, node, rotation, rarity: reward.rarity, chance: reward.chance })
                            }
                        }

                        for (const planetName of Object.keys(t.missionRewards)) {
                            const planet = t.missionRewards[planetName]
                            for (const nodeName of Object.keys(planet)) {
                                const rewards = planet[nodeName].rewards
                                const gameMode = planet[nodeName].gameMode
                                if (Array.isArray(rewards)) {
                                    addRewards(planetName, nodeName, null, rewards, gameMode)
                                } else {
                                    for (const rotation of Object.keys(rewards)) {
                                        addRewards(planetName, nodeName, rotation, rewards[rotation], gameMode)
                                    }
                                }
                            }
                        }
                        resolve(map);
        })
    }
};


exports.data = methods;