class Reward {
	constructor(itemName, modName, rarity, chance) {
		(this.itemName = itemName),
			(this.modName = modName),
			(this.rarity = rarity),
			(this.chance = chance);
	}
}

module.exports = Reward;