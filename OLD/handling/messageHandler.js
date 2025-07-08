'use strict'

const Discord = require('discord.js');
const logger = require('../logging/logger');

exports.slashMessage = async function(bot, interaction, warframeDropLocations, warframeRelicInfo, itemKeyWords) {
    try {
        let data = {
            warframeDropLocations: warframeDropLocations,
            warframeRelicInfo: warframeRelicInfo,
            itemKeyWords: itemKeyWords
        }
        if(interaction.data.options != undefined) {
            for(const option of interaction.data.options) {
                data[option.name] = option.value.toLowerCase();
            }
        }
        let commandFile = require(`../commands/${interaction.data.name}.js`);
        const result = await commandFile.run(data);
        if(typeof result == 'string') {
            return {content: result}
        }
        return result;
    } catch(err) {
        logger.error(err);
    }
}