"use strict";

const logger = require('../logging/logger');
const interactionSystem = require('../systems/interactionSystem');
const warframeUtils = require('../utils/warframeUtil');

exports.bot_interaction = async function(bot, prefix) {
    bot.ws.on('INTERACTION_CREATE', interaction => {
        logger.debug('Interaction received');
        let messageString = `${prefix}${interaction.data.name} `;
        if(interaction.data.options != undefined && interaction.data.options.length >= 1) {
            for(let i = 0; i < interaction.data.options.length; i++) {
                if(i == 1) messageString += " ";
                messageString += `${interaction.data.options[i].value.toLowerCase() == "yes" || interaction.data.options[i].value.toLowerCase() == "no" ? "-" + interaction.data.options[i].value : interaction.data.options[i].value}`
            }
        }
        logger.debug('Messagestring successfully created');
        interactionSystem.interaction_route(bot, interaction, messageString, prefix, warframeUtils.get_warframe_drop(), warframeUtils.get_warframe_relic(), warframeUtils.get_warframe_itemKey());
    });
}