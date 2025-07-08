"use strict";

const warframe = require("../handling/warframeHandler");
const helperMethods = require("../handling/helperMethods");
const relicImageList = require("../storage/ImageMapping/relicImage.json");
const relicRefinements = require("../storage/refinements.json");
const Discord = require("discord.js");
const logger = require("../logging/logger");

/**
 * Searches for specific relic
 * @param {Object} commandData Information about the relic and warframe data
 * @param commandData.type The relic type
 * @param commandData.name The relic name
 * @param commandData.refinement The relic refinement
 * @param commandData.warframeDropLocations Array of all drop locations
 * @returns {Promise<Object|String>} Discord interaction data
 */
exports.run = (commandData) => {
	return makeResult(commandData);
};

/**
 * Creates the result that will be returned.
 * @returns {Promise<Object|String>}
 */
async function makeResult(commandData) {
	try {
		//Format info correctly
		commandData.type = helperMethods.data.makeCapitalFirstLettersFromString(
			commandData.type
		);
		commandData.name = helperMethods.data.makeCapitalFirstLettersFromString(
			commandData.name
		);
		if (commandData.refinement == undefined) {
			commandData.refinement = "Intact";
		}
		commandData.refinement =
			helperMethods.data.makeCapitalFirstLettersFromString(
				commandData.refinement
			);

		/**
		 * Todo: Make refinement "searchable" - No need for exact input
		 */
		//commandData.refinement = relicRefinements.refinements.find(element => element > commandData.refinement);

		//Get the build info (Last time updated)
		const dropTableLastUpdated = await warframe.data.getBuildInfo();

		//Get relic info from relic name
		const relicInfo = await warframe.data.getRelicInfo(
			commandData.type,
			commandData.name + ".json",
			`${commandData.type} ${commandData.name}`
		);

		//Sort by chance and check if drops exist
		const readyTobeUsedData = await sortByChance(
			commandData.warframeDropLocations.get(
				`${relicInfo.tier.toLowerCase()} ${relicInfo.name.toLowerCase()} relic${
					commandData.refinement != "Intact"
						? ` (${commandData.refinement.toLowerCase()})`
						: ""
				}`
			)
		);

		//Creates the embed
		const makeEmbedForRelic = makeEmbed(
			relicInfo,
			readyTobeUsedData,
			dropTableLastUpdated.modified,
			commandData
		);
		return makeEmbedForRelic;
	} catch (err) {
		logger.error(err);
		return err;
	}
}

/**
 * Check if drops exist and sorts by chance
 * @param {Array} dropLocations
 * @returns
 */
function sortByChance(dropLocations) {
	//Check if drop locations exist
	if (dropLocations == undefined) {
		return "Vaulted";
	}

	//Sort data
	dropLocations.sort((a, b) => {
		return b.chance - a.chance;
	});

	//Return sorted drops
	return dropLocations;
}

/**
 * Creates the interaction data
 * @param {Object} relicInfo The relic information
 * @param {Array|String} dropLocations Drop locations
 * @param {Number} dropTableLastUpdated When droptables was updated
 * @param {Object} commandData Information about the relic and warframe data
 * @returns {Object} Interaction
 */
function makeEmbed(
	relicInfo,
	dropLocations,
	dropTableLastUpdated,
	commandData
) {
	//Interactive buttons
	let buttonComponents = {
		type: 1,
		components: [
			{
				type: 2,
				label: "Last page",
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

	//Check refinement
	if (commandData.refinement == undefined) {
		throw "Refinement type provided is not valid";
	}

	//Create the embed
	let relicEmbed = new Discord.MessageEmbed()
		.setColor(0x0099ff)
		.setTitle(
			`${relicInfo.tier} ${relicInfo.name} Relic (${commandData.refinement})`
		)
		.setDescription(
			`https://warframe.fandom.com/wiki/${relicInfo.tier}_${relicInfo.name}`
		)
		.setThumbnail(relicImageList[commandData.type][commandData.refinement])
		.setTimestamp(dropTableLastUpdated)
		.setFooter("Drop tables updated: ");

	//If relic is vaulted, only add relic content and message
	if (dropLocations == "Vaulted") {
		relicEmbed.addField(
			"\u200B",
			`**This relic is either vaulted, Digital Extreme didn't update the drop table yet or this item don't have any drop locations**`,
			false
		);
		for (const reward of relicInfo.rewards[commandData.refinement]) {
			relicEmbed.addField(
				reward.itemName,
				`Rarity: ${reward.rarity}\nchance: ${reward.chance.toFixed(2)} %`,
				true
			);
		}
		return { content: undefined, embeds: [relicEmbed] };
	}

	//Relic content
	for (const reward of relicInfo.rewards[commandData.refinement]) {
		relicEmbed.addField(
			reward.itemName,
			`Rarity: ${reward.rarity}\nchance: ${reward.chance.toFixed(2)} %`,
			true
		);
	}

	let cleanedDropLocations =
		helperMethods.data.cleanDroplocations(dropLocations);

	relicEmbed.addField(
		"\u200B",
		`**Drop locations - Page 1 of ${cleanedDropLocations.length % 9}**`,
		false
	);

	let counter = 0;
	for (const location of cleanedDropLocations) {
		if (counter == 9) break;
		relicEmbed.addField(
			`${location.planet} - ${location.node}`,
			`Type: ${location.gameMode}\nRotation: ${
				location.rotation
			}\nChance: ${location.chance.toFixed(2)} %`,
			true
		);
		counter++;
	}

	return {
		content: undefined,
		embeds: [relicEmbed],
		components: [buttonComponents],
	};
}
