'use strict';

const warframe = require('../handling/warframeHandler');
const WorldState = require('warframe-worldstate-parser');
const Discord = require("discord.js");
const logger = require('../logging/logger');

/**
 * Gets sortie information
 * @returns {Promise<Object|String>} Discord interaction data
 */
 exports.run = () => {
    return makeResult();
}

/**
 * Gathers the required information that will be used to create the interaction data 
 * @returns {Promise<Object|String>} The interaction data that will responded to the user
 */
async function makeResult() {
    try {
        //Get data
        const worldStateData = await warframe.data.getWorldState();

        //Parse data
        const ws = new WorldState(JSON.stringify(worldStateData));

        //Create interaction data
        const makeSortieEmbed = createEmbed(ws.sortie, ws.timestamp);
        return makeSortieEmbed;
    } catch(err) {
        logger.error(err);
        return err;
    }
}

/**
 * This function creates the data using the required information
 * @param {Object} worldState The world state object
 * @param {Object} worldStateTimestamp The world state timestamp
 * @returns {Object} Interaction data
 */
function createEmbed(worldState, worldStateTimestamp) {
    let sortieEmbed = new Discord.MessageEmbed()
                            .setColor(0x0099ff)
                            .setTitle(`Current sortie missions`)
                            .setThumbnail("https://vignette.wikia.nocookie.net/warframe/images/1/15/Sortie_b.png")
                            .addField('Mission 1', `Node: ${worldState.variants[0].node} \n Type: ${worldState.variants[0].missionType} \n Modifier: ${worldState.variants[0].modifier} \n Modifier Description: ${worldState.variants[0].modifierDescription}`, false)
                            .addField('Mission 2', `Node: ${worldState.variants[1].node} \n Type: ${worldState.variants[1].missionType} \n Modifier: ${worldState.variants[1].modifier} \n Modifier Description: ${worldState.variants[1].modifierDescription}`, false)
                            .addField('Mission 3', `Node: ${worldState.variants[2].node} \n Type: ${worldState.variants[2].missionType} \n Modifier: ${worldState.variants[2].modifier} \n Modifier Description: ${worldState.variants[2].modifierDescription}`, false)
                            .addField('Time left', worldState.eta, false)
                            .setTimestamp(worldStateTimestamp)
                            .setFooter('World state updated:  ')
    return {content: undefined, embeds: [sortieEmbed]}
}