"use strict";
require('dotenv').config();
const Discord = require('discord.js');
const messageHandler = require('./Handling/messageHandler.js');
const botOnReady = require('./Handling/botOnReady.js');
const warframe = require('./Handling/warframeHandler.js');
const AutoPoster = require('topgg-autoposter')
const commandList = require('./Storage/commands.json');

const bot = new Discord.Client({
    autoReconnect: true,
    unknownCommandResponse: false
});

const ap = AutoPoster(process.env.TOPGG_TOKEN, bot)

let warframeDropInfo, warframeRelicInfo, itemKeyWords;
sortData();

//Token
const token = process.env.DISCORD_TOKEN;

const prefix = 'wf.';

bot.on('ready', async () => {
    console.log(`Logged in as ${bot.user.tag}!`)
    bot.user.setActivity('wf.help')

    for(const command of commandList) {
        bot.api.applications(bot.user.id).commands.post(command).catch(err => {});
        //bot.api.applications(bot.user.id).guilds('476048969034629121').commands.post(command)
        //bot.api.applications(bot.user.id).guilds('476048969034629121').commands(command).post().catch(err => {console.log(err)});
    }
    //Delete commands from specific guild
/*     const things = await bot.api.applications(bot.user.id).guilds('476048969034629121').commands.get()
    for(const thing of things) {
        bot.api.applications(bot.user.id).guilds('476048969034629121').commands(thing.id).delete();
    } */
    
    bot.ws.on('INTERACTION_CREATE', async interaction => {
        let messageString = `${prefix}${interaction.data.name} `;
        if(interaction.data.options != undefined && interaction.data.options.length >= 1) {
            for(let i = 0; i < interaction.data.options.length; i++) {
                if(i == 1) messageString += " ";
                messageString += `${interaction.data.options[i].value.toLowerCase() == "yes" || interaction.data.options[i].value.toLowerCase() == "no" ? "-" + interaction.data.options[i].value : interaction.data.options[i].value}`
            }
        }
        const result = await messageHandler.slashMessage(bot, interaction.channel_id, messageString, prefix, warframeDropInfo, warframeRelicInfo, itemKeyWords)
        bot.api.interactions(interaction.id, interaction.token).callback.post({
            data: {
                type: 4,
                data: result
            }
        })
    });
    
    setInterval(function() {
        sortData();
    }, 21600000)
});

bot.on('message', message => {
    if(warframeDropInfo == undefined && warframeRelicInfo == undefined) {
        return;
    } else {
        messageHandler.chatMessage(message, message.author, prefix, warframeDropInfo, warframeRelicInfo, itemKeyWords);
    }
});

ap.on('posted', () => {
    console.log('Posted stats to Top.gg!')
})

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
        warframeRelicInfo = await botOnReady.data.sortDataRelicDrops(getWarframeRelicData);
        itemKeyWords = warframeDropInfo.keys();
        console.log("Done getting mission rewards and relic rewards!")
    } catch(err) {
        console.log(err);
    }   
}

bot.login(token);