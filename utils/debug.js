"use strict";

const logger = require('../logging/logger');
const commandList = require('../storage/commands.json');

//Delete commands from specific guild
exports.slash_delete_guild = async function(bot, guildId) {
    const things = await bot.api.applications(bot.user.id).guilds(guildId).commands.get()
    for(const thing of things) {
        bot.api.applications(bot.user.id).guilds(guildId).commands(thing.id).delete();
    } 
}

//Add command to specific guild
exports.slash_add_guild = function(bot, guildId, command) {
    bot.api.applications(bot.user.id).guilds(guildId).commands().post(command).catch(err => {console.log(err)});
}