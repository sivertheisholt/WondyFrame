require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');
const messageHandler = require('./Handling/messageHandler.js');
const botOnReady = require('./Handling/botOnReady.js');
const warframe = require('./Handling/warframeHandler.js');

const bot = new Discord.Client();

let warframeDropInfo, warframeRelicInfo;
sortData();

//Reconnect
const cli = new Discord.Client({ autoReconnect: true });

//Token
const token = process.env.DISCORD_TOKEN;

const prefix = '!';

bot.on('message', async message => {
    messageHandler.data.messageChecker(bot, message, message.author, prefix, warframeDropInfo, warframeRelicInfo);
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
        let getWarframeRelicData = await warframe.data.getAllRelicInfo();
        let getWarframeCetusBountyRewards = await warframe.data.getCetusBountyRewards();
        let getWarframeFortunaBountyRewards = await warframe.data.getFortunaBountyRewards();
        let getWarframeDeimosBountyRewards = await warframe.data.getDeimosBountyRewards();
        let getEnemyBlueprintDrops = await warframe.data.getEnemyBlueprintDrops();
        console.log("Getting mission rewards and relic rewards...");
        warframeDropInfo = await botOnReady.data.sortData(getWarframeData, getWarframeCetusBountyRewards, getWarframeFortunaBountyRewards, getWarframeDeimosBountyRewards, getEnemyBlueprintDrops);
        warframeRelicInfo = await botOnReady.data.sortDataRelicDrops(getWarframeRelicData);
    } catch(err) {
        console.log(err);
    }   
}

bot.login(token);