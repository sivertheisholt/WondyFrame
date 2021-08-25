'use strict';

const warframeUtil = require('../utils/warframeUtil'); 
const discordApi = require('../API/discord');
const helperMethods = require('../Handling/helperMethods');
const logger = require('../logging/logger');
const Discord = require('discord.js');

//Buttons for the interactions with drop locations
let buttonComponents = [
    {
        type: 1,
        components: [
            {
                type: 2,
                label: "Back",
                style: 1,
                custom_id: "click_back"
            },
            {
                type: 2,
                label: "Next",
                style: 1,
                custom_id: "click_next"
            }
        ]
    }
]

/**
 * This is the main command for a relic interaction
 * @param {Object} bot The bot client
 * @param {Object} interactionNew The newly created bot interaction
 * @param {Object} interactionOld The old interaction (map object from interactionSystem)
 */
exports.run = (bot, interactionNew, interactionOld) => {
    logger.debug('Relic interaction detected');

    //Sending respond that interaction was successfully received
    successRespond(bot, interactionNew.id, interactionNew.token);

    //Get page number [0] is current, [1] is total
    let pageNumbers = interactionNew.message.embeds[0].fields[6].value.match(/\d+/g)
    logger.debug('Page number created');

    //Get relic name
    let relicName = interactionNew.message.embeds[0].title.toLowerCase();
    logger.debug('Relic name created');

    //Check for intact or not
    if(relicName.search("(intact)") != -1) {
        let splitString = relicName.split(" ");
        relicName = `${splitString[0]} ${splitString[1]} ${splitString[2]}`        
    }

    //Get relic drop locations
    const relicDropLocations = sortByChance(warframeUtil.get_warframe_drop().get(relicName));
    logger.debug('Drop locations created');

    //Make a new MessageEmbed
    let relicEmbed = new Discord.MessageEmbed(interactionNew.message.embeds[0]);
    
    if(pageNumbers[0] == pageNumbers[1]) {
        //Do nothing - This should not happen
        //Button will not be available, but im putting a check here just in case
    } else {
        switch(interactionNew.data.custom_id) {
            case 'click_next':
                let dataNext = buttonNext(relicEmbed, relicDropLocations, parseInt(pageNumbers[0]), parseInt(pageNumbers[1]));
                discordApi.edit_original_interaction(interactionNew.application_id, interactionOld.token, dataNext);
                break;
            case 'click_back':
                let dataBack = buttonBack(relicEmbed, relicDropLocations, parseInt(pageNumbers[0]), parseInt(pageNumbers[1]));
                discordApi.edit_original_interaction(interactionNew.application_id, interactionOld.token, dataBack);
                break;
            default:
                logger.error('Could not identify interaction button - relicInteraction.js');
                break;
        }
    }
}

/**
 * Handles the PATCH request and data for the "next" interaction
 * @param {Object} embed 
 * @param {Array|String} drops 
 * @param {Number} currentPage 
 * @param {Number} lastPage 
 * @returns 
 */
function buttonNext(embed, drops, currentPage, lastPage) {
    removeDropFields(embed)
    getNextNine(embed, drops, currentPage);
    embed.fields[6].value = `**Drop locations - Page ${currentPage+1} of ${lastPage}**`
    return {content: undefined, embeds: [embed], buttonComponents}
}

/**
 * Handles the PATCH request and data for the "back" interaction
 * @param {Object} embed 
 * @param {Array|String} drops 
 * @param {Number} currentPage 
 * @param {Number} lastPage 
 * @returns {Object} Contains the new data for the old interaction
 */
function buttonBack(embed, drops, currentPage, lastPage) {
    removeDropFields(embed)
    getLastNine(embed, drops, currentPage);
    embed.fields[6].value = `**Drop locations - Page ${currentPage-1} of ${lastPage}**`
    return {content: undefined, embeds: [embed], buttonComponents}
}

/**
 * This function removes drop locations from embed
 * @param {Object} embed Discord embed
 */
function removeDropFields(embed) {
    embed.fields = embed.fields.slice(0,7)
}

/**
 * This functions adds next 9 drop locations to embed
 * @param {Array|String} drops Drop locations
 * @param {Number} currentPage Current page in embed
 * @param {Object} embed Discord embed
 */
function getNextNine(embed, drops, currentPage) {
    let counter = 0;
    for(let i = (currentPage) * 9; i < drops.length; i++) {
        if(counter == 9) break;
        embed.addField(`${drops[i].planet} - ${drops[i].node}`, `Type: ${drops[i].gameMode}\nRotation: ${drops[i].rotation}\nChance: ${(drops[i].chance).toFixed(2)} %`, true);
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
    for(let i = (currentPage-2) * 9; i < drops.length; i++) {
        if(counter == 9) break;
        embed.addField(`${drops[i].planet} - ${drops[i].node}`, `Type: ${drops[i].gameMode}\nRotation: ${drops[i].rotation}\nChance: ${(drops[i].chance).toFixed(2)} %`, true);
        counter++;
    }
}

/**
 * Check if drops exist and sorts by chance
 * @param {Array} dropLocations 
 * @returns {String|Array} Sorted array list or "Vaulted"
 */
function sortByChance(dropLocations) {
    //Check if drop locations exist
    if(dropLocations == undefined) {
        return "Vaulted";
    } 

    //Sort data
    dropLocations.sort((a, b) => {
        return b.chance - a.chance;
    });

    //Return sorted drops
    return dropLocations;
}

function successRespond(bot, interactionId, interactionToken) {
    bot.api.interactions(interactionId, interactionToken).callback.post({
        data: {
            type: 6
        }
    })
}