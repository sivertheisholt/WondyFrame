'user strict';

const warframe = require('../handling/warframeHandler');
const WorldState = require('warframe-worldstate-parser');
const Discord = require("discord.js");
const logger = require('../logging/logger');

/**
 * Gets fissure information
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
        const makeFissureEmbed = createEmbed(ws.fissures, ws.timestamp);
        return makeFissureEmbed;
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
    let fissureEmbed = new Discord.MessageEmbed()
                            .setColor(0x0099ff)
                            .setTitle('Current fissure missions')
                            .setThumbnail("https://raw.githubusercontent.com/wfcd/warframe-items/development/data/img/void-traces.png")
                            .setTimestamp(worldStateTimestamp)
                            .setFooter('World state updated:  ');
    for(const fissure of worldState) {
        fissureEmbed.addField(fissure.node, `Tier: ${fissure.tier} \n Type: ${fissure.missionType} \n Time left: ${fissure.eta}`, true);
    }
    return {content: undefined, embeds: [fissureEmbed]}
}