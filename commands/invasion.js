'use strict';

const warframe = require('../handling/warframeHandler');
const WorldState = require('warframe-worldstate-parser');
const Discord = require("discord.js");
const logger = require('../logging/logger');

/**
 * Gets invasion information
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
        const makeInvasionsEmbed = createEmbed(ws.invasions, ws.timestamp);
        return makeInvasionsEmbed;
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
    let invasionEmbed = new Discord.MessageEmbed()
                            .setColor(0x0099ff)
                            .setTitle('Invasions')
                            .setThumbnail("https://vignette.wikia.nocookie.net/warframe/images/2/26/InvasionSplash.png")
                            .setTimestamp(worldStateTimestamp)
                            .setFooter('World state updated: ')
    for(const invasion of worldState) {
        if(!invasion.completed) {
            invasionEmbed.addField('\u200B', `**${invasion.node}**`, false);
            invasionEmbed.addField(invasion.attackingFaction, invasion.attackerReward.asString == "" ? "No reward" : invasion.attackerReward.asString, true);
            invasionEmbed.addField(invasion.defendingFaction, invasion.defenderReward.asString == "" ? "No reward" : invasion.defenderReward.asString, true);
            invasionEmbed.addField('ETA', invasion.eta, true);
        }
    }
    return {content: undefined, embeds: [invasionEmbed]}
}