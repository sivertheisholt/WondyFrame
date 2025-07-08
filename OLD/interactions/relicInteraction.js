"use strict";

const warframeUtil = require("../utils/warframeUtil");
const discordApi = require("../api/discord");
const helperMethods = require("../handling/helperMethods");
const logger = require("../logging/logger");
const Discord = require("discord.js");

//Buttons for the interactions with drop locations
let buttonComponents = {
	type: 1,
	components: [
		{
			type: 2,
			label: "Previous page",
			style: 1,
			custom_id: "click_back",
			disabled: false,
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
 * This is the main command for a relic interaction
 * @param {Object} bot The bot client
 * @param {Object} interactionNew The newly created bot interaction
 * @param {Object} interactionOld The old interaction (map object from interactionSystem)
 */
exports.run = (bot, interactionNew, interactionOld) => {
	logger.debug("Relic interaction detected");

	//Sending respond that interaction was successfully received
	helperMethods.data.successRespond(
		bot,
		interactionNew.id,
		interactionNew.token
	);

	//Setting component to default again because its top-level variable
	buttonComponents.components[0].disabled = false;
	buttonComponents.components[1].disabled = false;

	//Get page number [0] is current, [1] is total
	let pageNumbers =
		interactionNew.message.embeds[0].fields[6].value.match(/\d+/g);
	logger.debug("Page number created");

	//Get relic name
	let relicName = interactionNew.message.embeds[0].title.toLowerCase();
	logger.debug("Relic name created");

	//Check for intact or not
	if (relicName.search("(intact)") != -1) {
		let splitString = relicName.split(" ");
		relicName = `${splitString[0]} ${splitString[1]} ${splitString[2]}`;
	}

	console.log(relicName);

	//Get relic drop locations
	const relicDropLocations = helperMethods.data.sortByChance(
		warframeUtil.get_warframe_drop().get(relicName)
	);
	logger.debug("Drop locations created");

	//Make a new MessageEmbed
	let relicEmbed = new Discord.MessageEmbed(interactionNew.message.embeds[0]);

	//Run correct event
	switch (interactionNew.data.custom_id) {
		case "click_next":
			//Make next button disabled if next interaction is on last page
			if (parseInt(pageNumbers[0]) + 1 === parseInt(pageNumbers[1])) {
				buttonComponents.components[1].disabled = true;
			}
			let dataNext = buttonNext(
				relicEmbed,
				relicDropLocations,
				parseInt(pageNumbers[0]),
				parseInt(pageNumbers[1])
			);
			discordApi.edit_original_interaction(
				interactionNew.application_id,
				interactionOld.token,
				dataNext
			);
			break;
		case "click_back":
			//Make back button disabled if next interaction is on first page
			if (parseInt(pageNumbers[0]) - 1 === 1) {
				buttonComponents.components[0].disabled = true;
			}
			let dataBack = buttonBack(
				relicEmbed,
				relicDropLocations,
				parseInt(pageNumbers[0]),
				parseInt(pageNumbers[1])
			);
			discordApi.edit_original_interaction(
				interactionNew.application_id,
				interactionOld.token,
				dataBack
			);
			break;
		default:
			logger.error(
				"Could not identify interaction button - relicInteraction.js"
			);
			break;
	}
};

/**
 * Handles the PATCH request and data for the "next" interaction
 * @param {Object} embed The new discord embed
 * @param {Array|String} drops Drops for the current relic
 * @param {Number} currentPage Current page we are on
 * @param {Number} lastPage Last page
 * @returns Contains the new data for the old interaction
 */
function buttonNext(embed, drops, currentPage, lastPage) {
	helperMethods.data.removeDropFields(embed, 7);
	getNextNine(embed, drops, currentPage);
	embed.fields[6].value = `**Drop locations - Page ${
		currentPage + 1
	} of ${lastPage}**`;
	return {
		content: undefined,
		embeds: [embed],
		components: [buttonComponents],
	};
}

/**
 * Handles the PATCH request and data for the "back" interaction
 * @param {Object} embed The new discord embed
 * @param {Array|String} drops Drops for the current relic
 * @param {Number} currentPage Current page we are on
 * @param {Number} lastPage Last page
 * @returns {Object} Contains the new data for the old interaction
 */
function buttonBack(embed, drops, currentPage, lastPage) {
	helperMethods.data.removeDropFields(embed, 7);
	getLastNine(embed, drops, currentPage);
	embed.fields[6].value = `**Drop locations - Page ${
		currentPage - 1
	} of ${lastPage}**`;
	return {
		content: undefined,
		embeds: [embed],
		components: [buttonComponents],
	};
}

/**
 * This functions adds next 9 drop locations to embed
 * @param {Array|String} drops Drop locations
 * @param {Number} currentPage Current page in embed
 * @param {Object} embed Discord embed
 */
function getNextNine(embed, drops, currentPage) {
	let counter = 0;
	for (let i = currentPage * 9; i < drops.length; i++) {
		if (counter == 9) break;
		embed.addField(
			`${drops[i].planet} - ${drops[i].node}`,
			`Type: ${drops[i].gameMode}\nRotation: ${
				drops[i].rotation
			}\nChance: ${drops[i].chance.toFixed(2)} %`,
			true
		);
		counter++;
	}
}

/**
 * This functions adds last 9 drop locations to embed
 * @param {Array|String} drops Drop locations
 * @param {Number} currentPage Current page in embed
 * @param {Object} embed Discord embed
 */
function getLastNine(embed, drops, currentPage) {
	let counter = 0;
	for (let i = (currentPage - 2) * 9; i < drops.length; i++) {
		if (counter == 9) break;
		embed.addField(
			`${drops[i].planet} - ${drops[i].node}`,
			`Type: ${drops[i].gameMode}\nRotation: ${
				drops[i].rotation
			}\nChance: ${drops[i].chance.toFixed(2)} %`,
			true
		);
		counter++;
	}
}
