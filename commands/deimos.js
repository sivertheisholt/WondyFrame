'use strict';

const warframe = require('../handling/warframeHandler');
const WorldState = require('warframe-worldstate-parser');
const helperMethods = require('../handling/helperMethods');
const Discord = require("discord.js");
const logger = require('../logging/logger');

/**
 * Gets deimos information
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
        const makeCambionEmbed = createEmbed(ws.cambionCycle, ws.timestamp);
        return makeCambionEmbed;
    } catch(err) {
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
    let expiry = new Date(worldState.expiry);
    let activation = new Date();
    var seconds = (expiry.getTime() - activation.getTime()) / 1000;

    let cambionEmbed = new Discord.MessageEmbed()
                            .setColor(0x0099ff)
                            .setTitle('Cambion Drift')
                            .setThumbnail("https://raw.githubusercontent.com/wfcd/warframe-items/development/data/img/heart-of-deimos.png")
                            .addField('Current state', helperMethods.data.makeCapitalFirstLettersFromString(worldState.active), false)
                            .addField('Time left', helperMethods.data.toHHMMSS(seconds), false)
                            .setTimestamp(worldStateTimestamp)
                            .setFooter('World state updated: ');
    return {content: undefined, embeds: [cambionEmbed]}
}