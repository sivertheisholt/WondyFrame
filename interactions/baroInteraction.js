'use strict';

const discordApi = require('../api/discord');
const helperMethods = require('../handling/helperMethods');
const logger = require('../logging/logger');
const Discord = require('discord.js');
const warframe = require('../handling/warframeHandler');
const WorldState = require('warframe-worldstate-parser');

//Buttons for the interactions with drop locations
let buttonComponents = {
    type: 1,
    components: [
        {
            type: 2,
            label: "Previous page",
            style: 1,
            custom_id: "click_back",
            disabled: false
        },
        {
            type: 2,
            label: "Next page",
            style: 1,
            custom_id: "click_next",
            disabled: false
        }
    ]
}

/**
 * This is the main command for a baro interaction
 * @param {Object} bot The bot client
 * @param {Object} interactionNew The newly created bot interaction
 * @param {Object} interactionOld The old interaction (map object from interactionSystem)
 */
 exports.run = async (bot, interactionNew, interactionOld) => {
    logger.debug('Baro interaction detected');

    //Sending respond that interaction was successfully received
    helperMethods.data.successRespond(bot, interactionNew.id, interactionNew.token);

    //Setting component to default again because its top-level variable
    buttonComponents.components[0].disabled = false;
    buttonComponents.components[1].disabled = false;
    
    //Get page number [0] is current, [1] is total
    let pageNumbers = interactionNew.message.embeds[0].fields[3].value.match(/\d+/g)
    logger.debug('Page number created');

    //Make a new MessageEmbed
    let baroEmbed = new Discord.MessageEmbed(interactionNew.message.embeds[0]);

    //Getting current world state
    const worldStateData = await warframe.data.getWorldState();

    //Parse data to WorldState object
    const ws = new WorldState(JSON.stringify(worldStateData));
    logger.debug('Worldstate data fetched');

    baroEmbed.setTimestamp(ws.timestamp)
        .setFooter('World state updated:');
            
    //Run correct event
    switch(interactionNew.data.custom_id) {
        case 'click_next':
            //Make next button disabled if next interaction is on last page
            if(parseInt(pageNumbers[0]) + 1 === parseInt(pageNumbers[1])) {
                buttonComponents.components[1].disabled = true;
            }
            let dataNext = buttonNext(baroEmbed, ws.voidTrader, parseInt(pageNumbers[0]), parseInt(pageNumbers[1]));
            discordApi.edit_original_interaction(interactionNew.application_id, interactionOld.token, dataNext);
            break;
        case 'click_back':
            //Make back button disabled if next interaction is on first page
            if(parseInt(pageNumbers[0]) - 1 === 1) {
                buttonComponents.components[0].disabled = true;
            }
            let dataBack = buttonBack(baroEmbed, ws.voidTrader, parseInt(pageNumbers[0]), parseInt(pageNumbers[1]));
            discordApi.edit_original_interaction(interactionNew.application_id, interactionOld.token, dataBack);
            break;
        default:
            logger.error('Could not identify interaction button - baroInteraction.js');
            break;
    }
}

/**
 * Handles the PATCH request and data for the "next" interaction
 * @param {Object} embed The new discord embed
 * @param {Object} voidTrader VoidTrader info
 * @param {Number} currentPage Current page we are on
 * @param {Number} lastPage Last page
 * @returns Contains the new data for the old interaction
 */
 function buttonNext(embed, voidTrader, currentPage, lastPage) {
    helperMethods.data.removeDropFields(embed, 4)
    getNext(embed, voidTrader.inventory);
    embed.fields[3].value = `**Inventory - Page ${currentPage+1} of ${lastPage}**`
    return {content: undefined, embeds: [embed], components: [buttonComponents]}
}

/**
 * Handles the PATCH request and data for the "back" interaction
 * @param {Object} embed The new discord embed
 * @param {Object} voidTrader VoidTrader info
 * @param {Number} currentPage Current page we are on
 * @param {Number} lastPage Last page
 * @returns {Object} Contains the new data for the old interaction
 */
function buttonBack(embed, voidTrader, currentPage, lastPage) {
    helperMethods.data.removeDropFields(embed, 4)
    getLast(embed, voidTrader.inventory);
    embed.fields[3].value = `**Inventory - Page ${currentPage-1} of ${lastPage}**`
    return {content: undefined, embeds: [embed], components: [buttonComponents]}
}

/**
 * Adds the next page to the embed
 * @param {Object} embed The embed to use
 * @param {Array} inventory The inventory to use
 */
function getNext(embed, inventory) {
    let newInventory = inventory.slice(inventory.length/2 + 0.5);
    for(const item of newInventory) {
        embed.addField(item.item, `Ducats: ${item.ducats} \n Credits: ${(helperMethods.data.makeNumberWithCommas(item.credits))}`, true);
    }
}

/**
 * Adds the last page to the embed
 * @param {Object} embed The embed to use
 * @param {Array} inventory The inventory to use
 */
function getLast(embed, inventory) {
    let newInventory = inventory.slice(0, inventory.length/2 + 0.5);
    for(const item of newInventory) {
        embed.addField(item.item, `Ducats: ${item.ducats} \n Credits: ${(helperMethods.data.makeNumberWithCommas(item.credits))}`, true);
    }
}