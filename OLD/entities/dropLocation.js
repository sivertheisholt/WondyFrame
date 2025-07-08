class DropLocation {
	constructor(
        name,
		planet,
		node,
		rotation,
		gameMode,
		blueprintDropChance,
		isEvent,
		rarity,
		chance
	) {
		this.planet = planet;
		this.node = node;
		this.rotation = rotation;
		this.gameMode = gameMode;
		this.blueprintDropChance = blueprintDropChance;
		this.isEvent = isEvent;
		this.rarity = rarity;
		this.chance = chance;
        this.name = name;
	}
}

module.exports = DropLocation;
