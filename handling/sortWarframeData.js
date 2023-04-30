"use strict";

const dojoItems = require("../storage/customItems/shopitems.json");
const Reward = require("../entities/reward");
const Drop = require("../entities/drop");
const DropLocation = require("../entities/dropLocation");

let methods = {
	/**
	 *
	 * @param {*} data
	 * @param data.missionRewards
	 * @param data.relicData
	 * @param data.cetusData
	 * @param data.fortunaData
	 * @param data.deimosData
	 * @param data.enemyBlueprintData
	 * @param data.transientData
	 * @param data.enemyModData
	 * @param data.miscData
	 * @param data.sortieData
	 * @returns
	 */
	sortData: async function (data) {
		return new Promise((resolve, reject) => {
			const map = new Map();

			function addRewardsArray(drop) {
				for (const reward of drop.rewards) {
					if (!reward.itemName && !reward.modName) continue;

					let name = (reward.itemName || reward.modName).toLowerCase();

					let r = map.get(name);
					if (!r) {
						r = [];
						map.set(name, r);
					}

					let dropLocation = new DropLocation(
						name,
						drop.planet,
						drop.node,
						drop.rotation,
						drop.gameMode,
						drop.bluprintDropChance,
						drop.isEvent,
						reward.rarity,
						reward.chance
					);
					r.push(dropLocation);
				}
			}

			function addRewards(drop) {
				if (Array.isArray(drop.rewards)) {
					addRewardsArray(drop);
				} else {
					for (const rotation of Object.keys(drop.rewards)) {
						let rotDrop = Object.assign({}, drop);
						rotDrop.rotation = rotation;
						rotDrop.rewards = drop.rewards[rotation];
						addRewardsArray(rotDrop);
					}
				}
			}

			/*
            
            const addRewards = (planetName, nodeName, rewards, gameMode, isEvent) => {
                if (Array.isArray(rewards)) {
                    addRewardsArray(planetName, nodeName, null, rewards, gameMode, null, isEvent)
                } else {
                    for (const rotation of Object.keys(rewards)) {
                        addRewardsArray(planetName, nodeName, rotation, rewards[rotation], gameMode, null, isEvent)
                    }
                }
            }

            const addRewardsShop = (name, rewards) => {
                if (Array.isArray(rewards)) {
                    addRewardsArray("Dojo", name, null, rewards, "Purchasable", null);
                } else {
                    for (const rotation of Object.keys(rewards)) {
                        addRewardsArray("Dojo", name, null, rewards, "Purchasable", null);
                    }
                }
            }

            */

			for (const key of Object.keys(data)) {
				//Missionrewards
				if (key == "missionRewards") {
					for (const planetName of Object.keys(data[key])) {
						const planet = data[key][planetName];
						console.log(planet);
						for (const nodeName of Object.keys(planet)) {
							const gameMode = planet[nodeName].gameMode;
							const isEvent = planet[nodeName].isEvent;
							const rewards = planet[nodeName].rewards;
							let drop = new Drop(
								planetName,
								nodeName,
								undefined,
								rewards,
								gameMode,
								undefined,
								isEvent
							);
							addRewards(drop);
						}
					}
					console.log("Missionrewards done");
					continue;
				}

				//Enemyblueprints
				if (key == "enemyBlueprintData") {
					for (const enemy of data[key]) {
						const planet = enemy.enemyName;
						const gameMode = "Enemy";

						let dropItems = new Drop(
							planet,
							undefined,
							undefined,
							enemy.items,
							gameMode,
							enemy.blueprintDropChance,
							undefined
						);

						let dropMods = new Drop(
							planet,
							undefined,
							undefined,
							enemy.mods,
							gameMode,
							enemy.blueprintDropChance,
							undefined
						);
						addRewards(dropItems);
						addRewards(dropMods);
					}
					console.log("enemy blueprint done");
					continue;
				}



				let planet;
				let gameMode;
				let nodeName;
				let rewards;
				let blueprintDropChance;

				for (const rewardData of data[key]) {
					//Sortie
					if (key == "sortieData") {
						planet = "Sortie";
						gameMode = "Sortie";
						nodeName = rewardData.bountyLevel;
						rewards = rewardData;
						console.log("Sortie done");
						continue;
					}

					//Bounties
					console.log("Adding cetus");
					if (key == "cetusData") {
						planet = "Cetus";
						gameMode = "Bounty";
						nodeName = rewardData.bountyLevel;
						rewards = rewardData.rewards;
					}
					console.log("Adding fortuna");
					if (key == "fortunaData") {
						planet = "Fortuna";
						gameMode = "Bounty";
						nodeName = rewardData.bountyLevel;
						rewards = rewardData.rewards;
					}

					console.log("Adding deimos");
					if (key == "deimosData") {
						planet = "Deimos";
						gameMode = "Bounty";
						nodeName = rewardData.bountyLevel;
						rewards = rewardData.rewards;
					}

					//Transient
					console.log("Adding transient");
					if (key == "transientData") {
						planet = rewardData.objectiveName;
						gameMode = "Transient";
						rewards = rewardData.rewards;
					}

					//EnemyMod
					console.log("Adding enemy mod data");
					if (key == "enemyModData") {
						planet = rewardData.enemyName;
						gameMode = "Enemy";
						rewards = rewardData.mods;
						blueprintDropChance = rewardData.enemyModDropChance;
					}

					//Misc
					console.log("Adding misc");
					if (key == "miscData") {
						planet = rewardData.enemyName;
						gameMode = "Enemy";
						rewards = rewardData.items;
						blueprintDropChance = rewardData.enemyItemDropChance;
					}

					//Shop
					console.log("Adding dojo");
					if (key == "dojoItems") {
						planet = "Dojo";
						gameMode = "Purchasable";
						nodeName = rewardData.name;
						rewards = rewardData.items;
					}
					let drop = new Drop(
						planet,
						nodeName,
						undefined,
						rewards,
						gameMode,
						blueprintDropChance,
						undefined
					);
					addRewards(drop);
					
				}
			}

			resolve(map);
		});
	},

	sortDataRelicDrops: async function (t) {
		const map = new Map();

		const addRewards = (tier, relicName, state, rewards, vaulted) => {
			for (const reward of rewards) {
				let r = map.get(reward.itemName.toLowerCase());
				if (!r) {
					r = [];
					map.set(reward.itemName.toLowerCase(), r);
				}
				r.push({
					tier,
					relicName,
					state,
					rarity: reward.rarity,
					chance: reward.chance,
					vaulted,
				});
			}
		};

		for (const relics of t) {
			const rewards = relics.rewards;
			const tier = relics.tier;
			const relicName = relics.relicName;
			const state = relics.state;

			if (Array.isArray(rewards)) {
				addRewards(tier, relicName, state, rewards, null);
			}
		}
		return map;
	},
};

exports.data = methods;
