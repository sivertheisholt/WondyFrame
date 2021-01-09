exports.run = (bot, message, relicType, relicName, relicRefinement, warframeDropLocations) => {
    const Discord = require('discord.js');
    const warframe = require('../Handling/warframeHandler');
    const helperMethods = require('../Handling/helperMethods');
    const relicImageList = require('../Storage/ImageMapping/relicImage.json');
    
    async function makeEmbed(relicInfo, dropLocations, dropTableLastUpdated) {
        relicType = await helperMethods.data.makeCapitalFirstLettersFromString(relicType);
        if(relicRefinement == undefined) {
            relicRefinement = "Intact";
        }
        relicRefinement = await helperMethods.data.makeCapitalFirstLettersFromString(relicRefinement);
        if(relicRefinement !== "Radiant" && relicRefinement !== "Flawless" && relicRefinement !== "Exceptional" && relicRefinement !== "Intact") {
            throw  relicRefinement + " is not an accepted refinement type";
        } else {
            const relicEmbed = {
                color: 0x0099ff,
                title: relicInfo.tier + " " + relicInfo.name + " " + relicRefinement,
                description: "https://warframe.fandom.com/wiki/" + relicInfo.tier + "_" + relicInfo.name,
                fields: [],
                thumbnail: {
                    url: relicImageList[relicType][relicRefinement],
                },
                timestamp: dropTableLastUpdated.modified,
                footer: {
                    text: 'Drop tables updated:  '
                },
            };
            for (const reward of relicInfo.rewards[relicRefinement]) {
                relicEmbed.fields.push({name: reward.itemName, value: "Rarity: " + reward.rarity + '\n' + "Chance: " + (reward.chance).toFixed(2) + " %", inline: true,})
            }
            if(dropLocations !== "Vaulted") {
                    relicEmbed.fields.push({name: `\u200B`, value: `**Top 9 drop locations**`, inline: false,})
                    let counter = 0;
                for (const location of dropLocations) {
                    if(counter == 9) {
                        break;
                    }
                    if(!location.isEvent) {
                        relicEmbed.fields.push({name: location.planet + " - " + location.node, value: "Type: " + location.gameMode + '\n' + "Rotation: " + location.rotation + '\n' + "Chance: " + (location.chance).toFixed(2) + " %", inline: true,})
                        counter++;
                    }
                }
            } else {
                relicEmbed.fields.push({name: '\u200B', value: `**This relic is either vaulted, Digital Extreme didn't update the drop table yet or this item don't have any drop locations**`, inline: false})
            }
            return relicEmbed;
        }
    }

    function getTopNine(dropLocations) {
        if(dropLocations == undefined) {
            return "Vaulted";
        } else {
            dropLocations.sort((a, b) => {
                return b.chance - a.chance;
            });
            return dropLocations;
        }
    }

    async function postResult() {
        try {
            message.channel.startTyping();
            const dropTableLastUpdated = await warframe.data.getBuildInfo();
            const relicInfo = await warframe.data.getRelicInfo(helperMethods.data.makeCapitalFirstLettersFromString(relicType), helperMethods.data.makeCapitalFirstLettersFromString(relicName) + ".json", `${relicType} ${relicName}`);
            let readyTobeUsedData;
            if(relicRefinement !== undefined) {
                readyTobeUsedData = await getTopNine(warframeDropLocations.get(relicInfo.tier.toLowerCase() + " " + relicInfo.name.toLowerCase() + " relic " + "("+relicRefinement+")"));
            } else {
                readyTobeUsedData = await getTopNine(warframeDropLocations.get(relicInfo.tier.toLowerCase() + " " + relicInfo.name.toLowerCase() + " relic"));
            }
            
            const makeEmbedForRelic = await makeEmbed(relicInfo, readyTobeUsedData, dropTableLastUpdated);
            await message.channel.send({ embed: makeEmbedForRelic }).catch(() => message.channel.stopTyping());
            message.channel.stopTyping();
        } catch (err) {
            message.channel.send(err).catch(() => message.channel.stopTyping());;
            message.channel.stopTyping();
        }
    }

    if(relicType !== undefined && relicName !== undefined) {
        postResult();
    } else {
        message.channel.send("You didn't write the command correctly. Please check WF.Help").catch(() => message.channel.stopTyping());
    }
}