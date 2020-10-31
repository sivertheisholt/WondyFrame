"use strict";
require('dotenv').config();
const Discord = require('discord.js');
const fs = require('fs');
const messageHandler = require('./Handling/messageHandler.js');
const botOnReady = require('./Handling/botOnReady.js');
const warframe = require('./Handling/warframeHandler.js');

const bot = new Discord.Client({
    autoReconnect: true,
    unknownCommandResponse: false
});


let warframeDropInfo, warframeRelicInfo, itemKeyWords;
sortData();

//Token
const token = process.env.DISCORD_TOKEN;

const prefix = 'wf.';

bot.on('ready', () => {
    console.log(`Logged in as ${bot.user.tag}!`)
    bot.user.setActivity('wf.help')
    setInterval(function() {
        sortData();
    }, 21600000)
});

bot.on('message', message => {
    if(warframeDropInfo == undefined && warframeRelicInfo == undefined) {
        return;
    } else {
        messageHandler.data.messageChecker(bot, message, message.author, prefix, warframeDropInfo, warframeRelicInfo, itemKeyWords);
    }
});

async function sortData() {
    try {
        console.log("Getting mission rewards and relic rewards...");
        let getWarframeData = await warframe.data.getMissionRewards();
        let getWarframeRelicData = await warframe.data.getAllRelicInfo();
        let getWarframeCetusBountyRewards = await warframe.data.getCetusBountyRewards();
        let getWarframeFortunaBountyRewards = await warframe.data.getFortunaBountyRewards();
        let getWarframeDeimosBountyRewards = await warframe.data.getDeimosBountyRewards();
        let getEnemyBlueprintDrops = await warframe.data.getEnemyBlueprintDrops();
        let getTransientRewards = await warframe.data.getTransientRewards();
        let getEnemyModDrops = await warframe.data.getEnemyModDrops();
        let getMiscItemDrops = await warframe.data.getMiscDrops();
        let getSortieRewards = await warframe.data.getSortieRewards();
        warframeDropInfo = await botOnReady.data.sortData(getWarframeData, getWarframeCetusBountyRewards, getWarframeFortunaBountyRewards, getWarframeDeimosBountyRewards, getEnemyBlueprintDrops, getTransientRewards, getEnemyModDrops, getMiscItemDrops, getSortieRewards);
        itemKeyWords = warframeDropInfo.keys();
        console.log("Done getting mission rewards and relic rewards!")
        warframeRelicInfo = await botOnReady.data.sortDataRelicDrops(getWarframeRelicData);
    } catch(err) {
        console.log(err);
    }   
}

bot.login(token);