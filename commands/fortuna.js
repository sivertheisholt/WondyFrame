'user strict';

const warframe = require('../handling/warframeHandler');
const WorldState = require('warframe-worldstate-parser');
const Discord = require("discord.js");
const logger = require('../logging/logger');

/**
 * Gets fortuna information
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
        const makeFortunaEmbed = createEmbed(ws.vallisCycle, ws.timestamp);
        return makeFortunaEmbed;
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
    let fortunaEmbed = new Discord.MessageEmbed()
                            .setColor(0x0099ff)
                            .setTitle('Orb Vallis')
                            .setThumbnail("https://raw.githubusercontent.com/wfcd/warframe-items/development/data/img/orb-vallis-scene.png")
                            .addField('Current state', worldState.isWarm ? "Warm" : "Cold", false)
                            .addField('Time left', worldState.timeLeft, false)
                            .setTimestamp(worldStateTimestamp)
                            .setFooter('World state updated');
    return {content: undefined, embeds: [fortunaEmbed]}
}