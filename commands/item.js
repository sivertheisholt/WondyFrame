"use strict";

const warframe = require("../handling/warframeHandler");
const helperMethods = require("../handling/helperMethods");
const Discord = require("discord.js");
const logger = require("../logging/logger");

/**
 * Searches for item
 * @param {Object} commandData Data holder
 * @param commandData.type The relic type
 * @param commandData.name The relic name
 * @param commandData.refinement The relic refinement
 * @param commandData.warframeDropLocations Array of all drop locations
 * @returns {Promise<Object|String>} Discord interaction data
 */
exports.run = (commandData) => {
	return makeResult(commandData);
};

let buttonComponents = {
	type: 1,
	components: [
		{
			type: 2,
			label: "Previous page",
			style: 1,
			custom_id: "click_back",
			disabled: true,
		},
		{
			type: 2,
			label: "Next page",
			style: 1,
			custom_id: "click_next",
			disabled: false,
		},
	],
};

/**
 * Creates the result that will be returned.
 * @returns {Promise<Object|String>}
 */
async function makeResult(commandData) {
	try {
		//Get drop table update time
		const dropTableLastUpdated = await warframe.data.getBuildInfo();

		console.log(commandData.item);

		//Try to find item name
		const tryToFindKey = await helperMethods.data.searchForItemInMap(
			commandData.item,
			commandData.warframeDropLocations
		);

		//Check if drop location is found
		if (tryToFindKey == undefined) {
			throw `Sorry I can't find any drop locations for: ${commandData.item}`;
		}

		//Check if item search is prime or not
		if (tryToFindKey.search("prime") !== -1) {
			//Prime item
			const makeEmbedForPrimeResult = createEmbedForPrime(
				tryToFindKey,
				commandData.warframeRelicInfo.get(tryToFindKey),
				commandData.warframeDropLocations,
				dropTableLastUpdated.modified,
				commandData.vaulted
			);
			return makeEmbedForPrimeResult;
		} else {
			//Non prime item
			const makeEmbedForNonPrimeResult = makeEmbedForNonPrime(
				tryToFindKey,
				helperMethods.data.sortByChance(
					commandData.warframeDropLocations.get(tryToFindKey)
				),
				dropTableLastUpdated.modified
			);
			return makeEmbedForNonPrimeResult;
		}
	} catch (err) {
		logger.error("Something went wrong creating item embed");
		logger.error(err);
		return err;
	}
}

/**
 * Creates the interaction data for prime item
 * @param {String} itemName The name of the item
 * @param {Array} relics The relics for the item
 * @param {Object} dropLocations The drop locations
 * @param {Number} dropTableLastUpdated When drop tables was last updated
 * @param {String} showVaulted To show vaulted or not
 * @returns {Object} Interaction data
 */
function createEmbedForPrime(
	itemName,
	relics,
	dropLocations,
	dropTableLastUpdated,
	showVaulted
) {
	showVaulted = showVaulted != undefined ? showVaulted : false;
	let isVaulted = true;
	let relicsToUse = [];
	let currentRelic;
	let selectMenuComponents = {
		type: 1,
		components: [
			{
				type: 3,
				custom_id: "item_new_selected",
				options: [],
				min_values: 1,
				max_values: 1,
			},
		],
	};

	//Check if vaulted - check for drop locations
	for (let relic of relics) {
		if (relic.state != "Intact") continue;
		if (
			dropLocations.get(
				`${relic.tier.toLowerCase()} ${relic.relicName.toLowerCase()} relic`
			) !== undefined
		) {
			relic.vaulted = "No";
			isVaulted = false;
			relicsToUse.push(relic);
		} else {
			relic.vaulted = "Yes";
			relicsToUse.push(relic);
		}
	}

	//Sort relics
	sortRelicsByVaulted(relicsToUse);

	//Create base embed
	let primeEmbed = new Discord.MessageEmbed()
		.setColor(0x0099ff)
		.setTitle(helperMethods.data.makeCapitalFirstLettersFromString(itemName))
		.setTimestamp(dropTableLastUpdated)
		.setFooter("Drop tables updated: ");

	//Check if vaulted
	if (isVaulted) {
		primeEmbed.setDescription(
			"**This item is vaulted or Digital Extreme didn't update the drop table yet.**"
		);
		for (const relic of relics) {
			primeEmbed.addField(
				`${relic.tier} ${relic.relicName}`,
				`Rarity: ${relic.rarity}\nChance: ${relic.chance.toFixed(
					3
				)}%\nExpected Runs: ${helperMethods.data.getExpectedRuns(
					relic.chance
				)}\nVaulted: ${relic.vaulted}`,
				true
			);
		}
	}

	//Add relics to list and embed
	let first = 0;
	for (const relic of relicsToUse) {
		let relicOption;
		//Check if relic is intact refinement
		if (relic.state != "Intact") continue;

		relicOption = {
			label: `${relic.tier} ${relic.relicName} ${
				relic.vaulted == "Yes" ? "(Vaulted)" : ""
			}`,
			value: `${relic.tier} ${relic.relicName}`,
		};

		//Add first relic to embed and make default selected
		if (first == 0) {
			primeEmbed.addField(
				`${relic.tier} ${relic.relicName}`,
				`Rarity: ${relic.rarity}\nChance: ${relic.chance.toFixed(
					3
				)}%\nExpected Runs: ${helperMethods.data.getExpectedRuns(
					relic.chance
				)}\nVaulted: ${relic.vaulted}`,
				true
			);
			relicOption.default = true;
			currentRelic = relic;
			first++;
		}

		selectMenuComponents.components[0].options.push(relicOption);
	}

	//Add drop locations
	if (!isVaulted) {
		//Add drop locations for first page
		let getDropLocations = dropLocations.get(
			`${currentRelic.tier.toLowerCase()} ${currentRelic.relicName.toLowerCase()} relic`
		);
		let sortedAfterChance = helperMethods.data.sortByChance(getDropLocations);
		let counterMaxSix = 0;

		primeEmbed.addField(
			"\u200B",
			`**Drop locations - Page 1 of ${sortedAfterChance.length % 9} **`,
			false
		);

		//Loop over drop locations
		if (currentRelic.vaulted == "No") {
			for (const location of sortedAfterChance) {
				if (counterMaxSix == 6) break;
				if (location.isEvent) continue;
				primeEmbed.addField(
					location.planet + " - " + location.node,
					"Type: " +
						location.gameMode +
						"\n" +
						"Rotation: " +
						location.rotation +
						"\n" +
						"Chance: " +
						location.chance.toFixed(3) +
						"%" +
						"\n" +
						`Expected Runs: ${helperMethods.data.getExpectedRuns(
							location.chance
						)}`,
					true
				);
				counterMaxSix++;
			}
		} else {
			primeEmbed.addField(
				"This item is vaulted or Digital Extreme didn't update the drop table yet."
			);
		}
	}
	return {
		content: undefined,
		embeds: [primeEmbed],
		components: [isVaulted ? null : selectMenuComponents, buttonComponents],
	};
}

/**
 * Sort relics by vaulted
 * @param {Array} relics
 * @returns {Array} Sorted array - Unvaulted first
 */
function sortRelicsByVaulted(relics) {
	//Sort data
	relics.sort((a, b) => {
		if (a.vaulted < b.vaulted) {
			return -1;
		}
		if (a.vaulted > b.vaulted) {
			return 1;
		}
		return 0;
	});

	return relics;
}
/**
 * Creates the interaction for non prime item
 * @param {String} itemName The item name
 * @param {Array|String} dropLocations The drop locations
 * @param {Number} dropTableLastUpdated When drop tables was last updated
 * @returns {Object} Interaction data
 */
function makeEmbedForNonPrime(itemName, dropLocations, dropTableLastUpdated) {
	//Create base embed
	let embed = new Discord.MessageEmbed()
		.setColor(0x0099ff)
		.setTitle(helperMethods.data.makeCapitalFirstLettersFromString(itemName))
		.setTimestamp(dropTableLastUpdated)
		.setFooter("Drop tables updated: ");

	helperMethods.data.cleanDroplocations(dropLocations);

	embed.addField(
		"\u200B",
		`**Drop locations - Page 1 of ${dropLocations.length % 12} **`,
		false
	);

	let counter = 0;
	for (const location of dropLocations) {
		if (counter == 12) break;

		if (location.gameMode == "Purchasable") {
			embed.addField(
				`Shop - ${location.node}`,
				"Type: " + location.gameMode,
				true
			);
		} else {
			embed.addField(
				`${location.planet} ${
					location.node == null ? "" : "- " + location.node
				}`,
				`Type: ${location.gameMode}\nRotation: ${
					location.rotation == null ? "None" : location.rotation
				}\nChance: ${location.chance.toFixed(
					2
				)} %\nExpected Runs: ${helperMethods.data.getExpectedRuns(
					location.chance.toFixed(3)
				)}`,
				true
			);
		}
		counter++;
	}
	return {
		content: undefined,
		embeds: [embed],
		components: [buttonComponents],
	};
}
