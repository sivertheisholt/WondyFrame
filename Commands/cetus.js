'use strict'

const warframe = require('../Handling/warframeHandler');
const WorldState = require('warframe-worldstate-parser');
const Discord = require("discord.js");
const logger = require('../logging/logger');

/**
 * Gets cetus information
 * @returns {Promise<Object>} Discord interaction data
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

        //Create the embed
        const makeCetusEmbed = await createEmbed(ws.cetusCycle, ws.timestamp);
        return makeCetusEmbed;
    } catch(err) {
        logger.error(err);
        return 'Something unexpected happen when trying to run the command!';
    }
}

/**
 * This function creates the data using the required information
 * @param {Object} worldState The world state object
 * @param {Object} worldStateTimestamp The world state timestamp
 * @returns {Object} Interaction data
 */
function createEmbed(worldState, worldStateTimestamp) {
    let cetusEmbed = new Discord.MessageEmbed()
                        .setColor(0x0099ff)
                        .setTitle('Cetus')
                        .setThumbnail('https://raw.githubusercontent.com/wfcd/warframe-items/development/data/img/plains-of-eidolon-scene.png')
                        .addField('Current state', worldState.isDay ? "Day" : "Night", false)
                        .addField('Time left', worldState.timeLeft, false)
                        .setTimestamp(worldStateTimestamp)
                        .setFooter('World state updated: ');
    return {content: undefined, embeds: [cetusEmbed]}
}