"use strict";

const logger = require('../logging/logger');
const commandList = require('../Storage/commands.json');
const refreshData = require('../utils/warframeUtil');
const debugCommands = require('../utils/debug');

exports.bot_ready = function(bot, warframeDropInfo, warframeRelicInfo, itemKeyWords) {
    bot.on('ready', async () => {
        logger.info(`Logged in as ${bot.user.tag}!`);
        bot.user.setActivity('wf.help');

        //Adding slash commands
        for(const command of commandList) {
            if(process.env.NODE_ENV.toUpperCase() === 'PRODUCTION') {
                bot.api.applications(bot.user.id).commands.post(command).catch(err => {});
            } else {
                debugCommands.slash_add_guild(bot, '476048969034629121', command);
                //debugCommands.slash_delete_guild(bot, '476048969034629121');
            }
        }

        //Set interval for refresh of warframe info
        setInterval(function() {
            refreshData.refreshData(warframeDropInfo, warframeRelicInfo, itemKeyWords);
        }, 21600000)
    });
}