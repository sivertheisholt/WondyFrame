"use strict";

const botReady = require('../events/botReady');
const botTopgg = require('../events/botTopgg');
const botMessage = require('../events/botMessage');
const botInteraction = require('../events/botInteractionCreate');
const warframeUtils = require('../utils/warframeUtil');
const logger = require('../logging/logger');

exports.initialize = async function(bot, prefix) {
    let result = await warframeUtils.refreshData();
    if(!result) throw new Error("Could not retrieve warframe information");

    botReady.bot_ready(bot);
    botMessage.bot_message(bot, prefix);
    //botTopgg.bot_topgg(bot);
    botInteraction.bot_interaction(bot);

    return true;
}