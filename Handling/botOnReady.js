const warframe = require('../Handling/warframeHandler');
var methods = {
    sortData: async function (t, t2, t3, t4, t5, t6, t7, t8, t9) {
        return new Promise((resolve, reject) => {
            const map = new Map()
            const addRewardsArray = (planet, node, rotation, rewards, gameMode, blueprintDropChance, isEvent) => {
                for (const reward of rewards) {
                    if(reward.itemName !== undefined) {
                        let r = map.get(reward.itemName)
                        if (!r) {
                            r = []
                            map.set(reward.itemName, r)
                        }
                        r.push({ isEvent, gameMode, planet, node, rotation, rarity: reward.rarity, chance: reward.chance, blueprintDropChance })
                    } else {
                        let r = map.get(reward.modName)
                        if (!r) {
                            r = []
                            map.set(reward.modName, r)
                        }
                        r.push({ isEvent, gameMode, planet, node, rotation, rarity: reward.rarity, chance: reward.chance, blueprintDropChance })
                    }
                }
            }
            const addRewards = (planetName, nodeName, rewards, gameMode, isEvent) => {
                if (Array.isArray(rewards)) {
                    addRewardsArray(planetName, nodeName, null, rewards, gameMode, null, isEvent)
                } else {
                    for (const rotation of Object.keys(rewards)) {
                        addRewardsArray(planetName, nodeName, rotation, rewards[rotation], gameMode, null, isEvent)
                    }
                }
            }
            const addRewardsEnemy = (planetName, nodeName, rewards, gameMode, blueprintDropChance) => {
                if (Array.isArray(rewards)) {
                    addRewardsArray(planetName, nodeName, null, rewards, gameMode, blueprintDropChance)
                } else {
                    for (const rotation of Object.keys(rewards)) {
                        addRewardsArray(planetName, nodeName, rotation, rewards[rotation], gameMode, blueprintDropChance)
                    }
                }
            }

            for (const planetName of Object.keys(t.missionRewards)) {
                const planet = t.missionRewards[planetName]
                for (const nodeName of Object.keys(planet)) {
                    const rewards = planet[nodeName].rewards;
                    const gameMode = planet[nodeName].gameMode;
                    const isEvent = planet[nodeName].isEvent;
                    addRewards(planetName, nodeName, rewards, gameMode, isEvent);
                }
            }
            for (const bounty of t2.cetusBountyRewards) {
                addRewards("Cetus", bounty.bountyLevel, bounty.rewards, "Bounty");
            }
            for (const bounty of t3.solarisBountyRewards) {
                addRewards("Fortuna", bounty.bountyLevel, bounty.rewards, "Bounty");
            }
            for (const bounty of t4.deimosRewards) {
                addRewards("Deimos", bounty.bountyLevel, bounty.rewards, "Bounty");
            }
            for(const enemyBlueprintDrop of t5.enemyBlueprintTables) {
                addRewardsEnemy(enemyBlueprintDrop.enemyName, null, enemyBlueprintDrop.items, "Enemy", enemyBlueprintDrop.blueprintDropChance.slice(4));
            }
            for(const transientRewards of t6.transientRewards) {
                addRewards(transientRewards.objectiveName, null, transientRewards.rewards, "Transient", null);
            }
            for(const enemyModDrop of t7.enemyModTables) {
                addRewardsEnemy(enemyModDrop.enemyName, null, enemyModDrop.mods, "Enemy", enemyModDrop.enemyModDropChance);
            }
            for(const miscItem of t8.miscItems) {
                addRewardsEnemy(miscItem.enemyName, null, miscItem.items, "Enemy", miscItem.enemyItemDropChance);
            }
            /* for(const sortieReward of t9.sortieRewards) {
                addRewards("Sortie", null, sortieReward, "Sortie");
            } */
            
            resolve(map);
        })
    },
    sortDataRelicDrops: async function (t) {
        return new Promise((resolve, reject) => {
            const map = new Map()
            
            const addRewards = (tier, relicName, state, rewards, vaulted) => {
                for (const reward of rewards) {
                    let r = map.get(reward.itemName.toLowerCase())
                    if (!r) {
                        r = []
                        map.set(reward.itemName.toLowerCase(), r)
                    }
                    r.push({ tier, relicName, state, rarity: reward.rarity, chance: reward.chance, vaulted})
                }
            }

            for (const relics of t.relics) {
                const rewards = relics.rewards;
                const tier = relics.tier;
                const relicName = relics.relicName;
                const state = relics.state;

                if (Array.isArray(rewards)) {
                    addRewards(tier, relicName, state, rewards, null)
                }
            }
            resolve(map);
        })
    }
};


exports.data = methods;