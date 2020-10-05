require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');
const messageHandler = require('./Handling/messageHandler.js');
const botOnReady = require('./Handling/botOnReady.js');
const warframe = require('./Handling/warframeHandler.js');

const bot = new Discord.Client();

let warframeInfoSorted;
sortData()

//Reconnect
const cli = new Discord.Client({ autoReconnect: true });

//Token
const token = process.env.DISCORD_TOKEN;

const prefix = '!';

bot.on('message', async message => {
    messageHandler.data.messageChecker(bot, message, message.author, prefix, warframeInfoSorted);
});

bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`)
    bot.user.setActivity('!help')
    setInterval(function() {
        sortData()
    }, 10000000)
})

async function sortData() {
    try {
        let getWarframeData = await warframe.data.getMissionRewards();
        console.log("Getting mission rewards");
        warframeInfoSorted = await botOnReady.data.sortData(getWarframeData);
        //await console.log(warframeInfoSorted);
    } catch(err) {
        console.log(err);
    }   
}

bot.login(token);