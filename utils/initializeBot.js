"use strict";

const botReady = require('../events/botReady');
const botTopgg = require('../events/botTopgg');
const botMessage = require('../events/botMessage');
const botInteraction = require('../events/botInteractionCreate');
const refreshData = require('../utils/warframeUtil');
const logger = require('../logging/logger');

exports.initialize = async function(bot, prefix) {
    //Warframe info
    let warframeDropInfo, warframeRelicInfo, itemKeyWords;
    const resWarframe = await refreshData.refreshData(warframeDropInfo, warframeRelicInfo, itemKeyWords);
    if(!resWarframe) return false;

    botReady.bot_ready(bot, warframeDropInfo, warframeRelicInfo, itemKeyWords);
    botMessage.bot_message(bot, prefix);
    botTopgg.bot_topgg(bot);
    botInteraction.bot_interaction(bot);

    return true;
}