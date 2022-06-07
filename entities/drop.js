class Drop {
	constructor(
		planet,
		node,
		rotation,
		rewards,
		gameMode,
		blueprintDropChance,
		isEvent
	) {
		this.planet = planet;
		this.node = node;
		this.rotation = rotation;
		this.rewards = rewards;
		this.gameMode = gameMode;
		this.blueprintDropChance = blueprintDropChance;
		this.isEvent = isEvent;
	}
}

module.exports = Drop;