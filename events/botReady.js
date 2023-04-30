"use strict";

const logger = require('../logging/logger');
const commandList = require('../storage/commands.json');
const debugCommands = require('../utils/debug');

exports.bot_ready = function(bot) {
    bot.on('ready', async () => {
        logger.info(`Logged in as ${bot.user.tag}!`);
        bot.user.setActivity('Use slash(/) commands!');

        //Adding slash commands
        for(const command of commandList) {
            if(process.env.NODE_ENV.toUpperCase() === 'PRODUCTION') {
                bot.api.applications(bot.user.id).commands.post(command).catch(err => {});
            } else {
                debugCommands.slash_add_guild(bot, '476048969034629121', command);
                //debugCommands.slash_delete_guild(bot, '476048969034629121');
            }
        }
    });
}