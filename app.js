"use strict";

require('dotenv').config();
const Discord = require('discord.js');
const logger = require('./logging/logger');
const initializer = require('./utils/initializeBot');

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
    } catch(err) {
        logger.error(err);
        restartBot();
    }
}

function restartBot() {
    logger.info("Trying to restart bot because of crash...")
    startBot();
}

try {
    logger.info("Starting up bot");
    startBot();
} catch(err) {
    logger.error(err);
    //Do something
}