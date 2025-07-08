"use strict";

const discordApi = require("../api/discord");
const helperMethods = require("../handling/helperMethods");
const logger = require("../logging/logger");
const Discord = require("discord.js");
const warframe = require("../handling/warframeHandler");
const warframeUtil = require("../utils/warframeUtil");

//Buttons for the interactions with drop locations
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
 * This is the main command for an item interaction
 * @param {Object} bot The bot client
 * @param {Object} interactionNew The newly created bot interaction
 * @param {Object} interactionOld The old interaction (map object from interactionSystem)
 */
exports.run = async (bot, interactionNew, interactionOld) => {
	logger.debug("Item interaction detected");
	let isPrime =
		interactionNew.message.embeds[0].title.toLowerCase().search("prime") !== -1
			? true
			: false;

	//Sending respond that interaction was successfully received
	helperMethods.data.successRespond(
		bot,
		interactionNew.id,
		interactionNew.token
	);

	//Setting component to default again because its top-level variable
	buttonComponents.components[0].disabled = false;
	buttonComponents.components[1].disabled = false;

	//Make a new MessageEmbed
	let itemEmbed = new Discord.MessageEmbed(interactionNew.message.embeds[0]);

	//Get select menu
	let selectMenu = isPrime ? interactionNew.message.components[0] : null;

	//Get item name
	let itemName = isPrime
		? interactionNew.message.embeds[0].fields[0].name.toLowerCase() + " relic"
		: interactionNew.message.embeds[0].title.toLowerCase();
	logger.debug("Item name created");

	//Get item drop locations
	const itemDropLocations = helperMethods.data.sortByChance(
		helperMethods.data.cleanDroplocations(
			warframeUtil.get_warframe_drop().get(itemName)
		)
	);
	logger.debug("Drop locations created");

	//Get page number [0] is current, [1] is total
	let pageNumbers = isPrime
		? interactionNew.message.embeds[0].fields[1].value.match(/\d+/g)
		: interactionNew.message.embeds[0].fields[0].value.match(/\d+/g);
	logger.debug("Page number created");

	//Run correct event
	switch (interactionNew.data.custom_id) {
		case "click_next":
			//Make next button disabled if next interaction is on last page
			if (parseInt(pageNumbers[0]) + 1 === parseInt(pageNumbers[1])) {
				buttonComponents.components[1].disabled = true;
			}

			let dataNext;
			if (isPrime) {
				dataNext = buttonNextPrime(
					itemEmbed,
					itemDropLocations,
					parseInt(pageNumbers[0]),
					parseInt(pageNumbers[1]),
					selectMenu
				);
			} else {
				dataNext = buttonNext(
					itemEmbed,
					itemDropLocations,
					parseInt(pageNumbers[0]),
					parseInt(pageNumbers[1])
				);
			}
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

			let dataBack;
			if (isPrime) {
				dataBack = buttonBackPrime(
					itemEmbed,
					itemDropLocations,
					parseInt(pageNumbers[0]),
					parseInt(pageNumbers[1]),
					selectMenu
				);
			} else {
				dataBack = buttonBack(
					itemEmbed,
					itemDropLocations,
					parseInt(pageNumbers[0]),
					parseInt(pageNumbers[1])
				);
			}

			discordApi.edit_original_interaction(
				interactionNew.application_id,
				interactionOld.token,
				dataBack
			);
			break;
		case "item_new_selected":
			let dataNew = buttonBack(
				itemEmbed,
				itemDropLocations,
				parseInt(pageNumbers[0]),
				parseInt(pageNumbers[1])
			);
			discordApi.edit_original_interaction(
				interactionNew.application_id,
				interactionOld.token,
				dataNew
			);
			break;
		default:
			logger.error(
				"Could not identify interaction button - itemInteraction.js"
			);
			break;
	}
};

/**
 * Handles the PATCH request and data for the "next" interaction
 * @param {Object} itemEmbed The new discord embed
 * @param {Object} dropLocations Droplocations info
 * @param {Number} currentPage Current page we are on
 * @param {Number} lastPage Last page
 * @returns Contains the new data for the old interaction
 */
function buttonNextPrime(
	itemEmbed,
	dropLocations,
	currentPage,
	lastPage,
	selectMenu
) {
	helperMethods.data.removeDropFields(itemEmbed, 2);
	getNextNinePrime(itemEmbed, dropLocations, currentPage);
	itemEmbed.fields[1].value = `**Drop locations - Page ${
		currentPage + 1
	} of ${lastPage}**`;
	return {
		content: undefined,
		embeds: [itemEmbed],
		components: [selectMenu, buttonComponents],
	};
}

/**
 * Handles the PATCH request and data for the "back" interaction
 * @param {Object} itemEmbed The new discord embed
 * @param {Object} dropLocations Droplocations info
 * @param {Number} currentPage Current page we are on
 * @param {Number} lastPage Last page
 * @returns {Object} Contains the new data for the old interaction
 */
function buttonBackPrime(
	itemEmbed,
	dropLocations,
	currentPage,
	lastPage,
	selectMenu
) {
	helperMethods.data.removeDropFields(itemEmbed, 2);
	getLastNinePrime(itemEmbed, dropLocations, currentPage);
	itemEmbed.fields[1].value = `**Drop locations - Page ${
		currentPage - 1
	} of ${lastPage}**`;
	return {
		content: undefined,
		embeds: [itemEmbed],
		components: [selectMenu, buttonComponents],
	};
}

/**
 * This functions adds next 9 drop locations to embed
 * @param {Array|String} drops Drop locations
 * @param {Number} currentPage Current page in embed
 * @param {Object} itemEmbed Discord embed
 */
function getNextNinePrime(itemEmbed, drops, currentPage) {
	let counter = 0;
	for (let i = currentPage * 9; i < drops.length; i++) {
		if (counter == 9) break;
		itemEmbed.addField(
			`${drops[i].planet} - ${drops[i].node}`,
			`Type: ${drops[i].gameMode}\nRotation: ${
				drops[i].rotation
			}\nChance: ${drops[i].chance.toFixed(
				2
			)} %\nExpected Runs: ${helperMethods.data.getExpectedRuns(
				drops[i].chance.toFixed(3)
			)}`,
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
function getLastNinePrime(itemEmbed, drops, currentPage) {
	let counter = 0;
	for (let i = (currentPage - 2) * 9; i < drops.length; i++) {
		if (counter == 9) break;
		itemEmbed.addField(
			`${drops[i].planet} - ${drops[i].node}`,
			`Type: ${drops[i].gameMode}\nRotation: ${
				drops[i].rotation
			}\nChance: ${drops[i].chance.toFixed(
				2
			)} %\nExpected Runs: ${helperMethods.data.getExpectedRuns(
				drops[i].chance.toFixed(3)
			)}`,
			true
		);
		counter++;
	}
}

/**
 * Handles the PATCH request and data for the "next" interaction
 * @param {Object} itemEmbed The new discord embed
 * @param {Object} dropLocations Droplocations info
 * @param {Number} currentPage Current page we are on
 * @param {Number} lastPage Last page
 * @returns Contains the new data for the old interaction
 */
function buttonNext(itemEmbed, dropLocations, currentPage, lastPage) {
	helperMethods.data.removeDropFields(itemEmbed, 1);
	getNextTwelve(itemEmbed, dropLocations, currentPage);
	itemEmbed.fields[0].value = `**Drop locations - Page ${
		currentPage + 1
	} of ${lastPage}**`;
	return {
		content: undefined,
		embeds: [itemEmbed],
		components: [buttonComponents],
	};
}

/**
 * Handles the PATCH request and data for the "back" interaction
 * @param {Object} itemEmbed The new discord embed
 * @param {Object} dropLocations Droplocations info
 * @param {Number} currentPage Current page we are on
 * @param {Number} lastPage Last page
 * @returns {Object} Contains the new data for the old interaction
 */
function buttonBack(itemEmbed, dropLocations, currentPage, lastPage) {
	helperMethods.data.removeDropFields(itemEmbed, 1);
	getLastTwelve(itemEmbed, dropLocations, currentPage);
	itemEmbed.fields[0].value = `**Drop locations - Page ${
		currentPage - 1
	} of ${lastPage}**`;
	return {
		content: undefined,
		embeds: [itemEmbed],
		components: [buttonComponents],
	};
}

/**
 * This functions adds next 12 drop locations to embed
 * @param {Array|String} drops Drop locations
 * @param {Number} currentPage Current page in embed
 * @param {Object} itemEmbed Discord embed
 */
function getNextTwelve(itemEmbed, drops, currentPage) {
	let counter = 0;
	for (let i = currentPage * 12; i < drops.length; i++) {
		if (counter == 12) break;
		itemEmbed.addField(
			`${drops[i].planet} ${drops[i].node == null ? "" : "- " + drops[i].node}`,
			`Type: ${drops[i].gameMode}\nRotation: ${
				drops[i].rotation == null ? "None" : drops[i].rotation
			}\nChance: ${drops[i].chance.toFixed(
				2
			)} %\nExpected Runs: ${helperMethods.data.getExpectedRuns(
				drops[i].chance.toFixed(3)
			)}`,
			true
		);
		counter++;
	}
}

/**
 * This functions adds last 12 drop locations to embed
 * @param {Array|String} drops Drop locations
 * @param {Number} currentPage Current page in embed
 * @param {Object} embed Discord embed
 */
function getLastTwelve(itemEmbed, drops, currentPage) {
	let counter = 0;
	for (let i = (currentPage - 2) * 12; i < drops.length; i++) {
		if (counter == 12) break;
		itemEmbed.addField(
			`${drops[i].planet} ${drops[i].node == null ? "" : "- " + drops[i].node}`,
			`Type: ${drops[i].gameMode}\nRotation: ${
				drops[i].rotation == null ? "None" : drops[i].rotation
			}\nChance: ${drops[i].chance.toFixed(
				2
			)} %\nExpected Runs: ${helperMethods.data.getExpectedRuns(
				drops[i].chance.toFixed(3)
			)}`,
			true
		);
		counter++;
	}
}
