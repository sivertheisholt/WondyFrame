"use strict";

const logger = require('../logging/logger');
const interactionSystem = require('../systems/interactionSystem');
const warframeUtils = require('../utils/warframeUtil');

exports.bot_interaction = async function(bot) {
    bot.ws.on('INTERACTION_CREATE', interaction => {
        logger.debug('Interaction received');
        interactionSystem.interaction_route(bot, interaction, warframeUtils.get_warframe_drop(), warframeUtils.get_warframe_relic(), warframeUtils.get_warframe_itemKey());
    });
}