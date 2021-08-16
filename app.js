"use strict";

require('dotenv').config();
const Discord = require('discord.js');
const logger = require('./logging/logger');
const initializer = require('./utils/initializeBot');
const refreshData = require('./utils/warframeUtil');

//Start the bot
async function startBot() {
    try {
        
        //Token
        const token = process.env.DISCORD_TOKEN;

        //Prefix
        const prefix = 'wf.';

        //Create bot
        const bot = new Discord.Client({
            autoReconnect: true,
            unknownCommandResponse: false
        });
    
        //Initialize systems
        const initializationResult = await initializer.initialize(bot, prefix);
        if(!initializationResult) throw new Error("Could not initialize systems");

        //Log bot in
        bot.login(token);

        //Set interval for refresh of warframe info
        setInterval(async function() {
            const values = await refreshData.refreshData(warframeDropInfo, warframeRelicInfo, itemKeyWords);
            if(!values) throw new Error("Could not retrieve warframe information");
        }, 21600000)
    } catch(err) {
        logger.error(err);
        restartBot();
    }
}

//Restarts bot
async function restartBot() {
    logger.log({level: 'info', message: `Trying to restart bot in 5 minutes!`});
    await new Promise(r => setTimeout(r, 1000 * 60 * 5));
    logger.log({level: 'info', message: `Restarting bot now!`});
    startBot();
}

try {
    logger.info("Starting up bot");
    startBot();
} catch(err) {
    logger.error(err);
    //Do something
}