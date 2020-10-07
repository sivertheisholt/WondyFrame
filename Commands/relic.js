exports.run = (bot, message, relicType, relicName, relicRefinement, warframeDropLocations) => {
    const Discord = require('discord.js');
    const warframe = require('../Handling/warframeHandler');
    const helperMethods = require('../Handling/helperMethods');
    const relicImageList = require('../Storage/ImageMapping/relicImage.json');
    
    function makeEmbed(relicInfo, dropLocations, dropTableLastUpdated) {
        return new Promise((resolve, reject) => {
            relicType = helperMethods.data.makeCapitalFirstLettersFromString(relicType);
            if(relicRefinement == undefined) {
                relicRefinement = "Intact";
            }
            relicRefinement = helperMethods.data.makeCapitalFirstLettersFromString(relicRefinement);
            if(relicRefinement !== "Radiant" && relicRefinement !== "Flawless" && relicRefinement !== "Exceptional" && relicRefinement !== "Intact") {
                reject(relicRefinement + " is not an accepted refinement type")
            } else {
                const relicEmbed = {
                    color: 0x0099ff,
                    title: relicInfo.tier + " " + relicInfo.name + " " + relicRefinement,
                    description: "https://warframe.fandom.com/wiki/" + relicInfo.tier + "_" + relicInfo.name,
                    fields: [],
                    image: {
                        url: relicImageList[relicType][relicRefinement],
                    },
                    timestamp: dropTableLastUpdated.modified,
                    footer: {
                        text: 'Drop tables updated:  '
                    },
                };
                for (const reward of relicInfo.rewards[relicRefinement]) {
                    relicEmbed.fields.push({name: reward.itemName, value: "Rarity: " + reward.rarity + '\n' + "Chance: " + reward.chance + " %", inline: true,})
                }
                if(dropLocations !== "Vaulted") {
                        relicEmbed.fields.push({name: `\u200B`, value: `**Top 9 drop locations**`, inline: false,})
                        let counter = 0;
                    for (const location of dropLocations) {
                        if(counter == 9) {
                            break;
                        }
                        relicEmbed.fields.push({name: location.planet + " - " + location.node, value: "Type: " + location.gameMode + '\n' + "Rotation: " + location.rotation + '\n' + "Chance: " + location.chance + " %", inline: true,})
                        counter++;
                    }
                } else {
                    relicEmbed.fields.push({name: '\u200B', value: `**This relic is either vaulted, Digital Extreme didn't update the drop table yet or this item don't have any drop locations**`, inline: false})
                }
                
                resolve(relicEmbed);
            }
        });
    }

    function getTopNine(dropLocations) {
        return new Promise((resolve, reject) => {
            try {
                if(dropLocations == undefined) {
                    resolve("Vaulted")
                } else {
                    dropLocations.sort((a, b) => {
                        return b.chance - a.chance;
                    });
                    resolve(dropLocations);
                }
            } catch (err) {
                reject(err);
            }
        })
    }

    async function postResult() {
        try {
            const dropTableLastUpdated = await warframe.data.getBuildInfo();
            const relicInfo = await warframe.data.getRelicInfo(helperMethods.data.makeCapitalFirstLettersFromString(relicType), helperMethods.data.makeCapitalFirstLettersFromString(relicName) + ".json");
            console.log('Searching for relic...');
            let readyTobeUsedData;
            if(relicRefinement !== undefined) {
                readyTobeUsedData = await getTopNine(warframeDropLocations.get(relicInfo.tier + " " + relicInfo.name + " Relic " + "("+helperMethods.data.makeCapitalFirstLettersFromString(relicRefinement)+")"));
            } else {
                readyTobeUsedData = await getTopNine(warframeDropLocations.get(relicInfo.tier + " " + relicInfo.name + " Relic"));
            }
            const makeEmbedForRelic = await makeEmbed(relicInfo, readyTobeUsedData, dropTableLastUpdated);
            console.log('Making embed...');
            await message.channel.send({ embed: makeEmbedForRelic });
        } catch (err) {
            message.channel.send(err);
        }
    }

    if(relicType !== undefined && relicName !== undefined) {
        postResult();
    } else {
        message.channel.send("You didn't write the command correctly. Please check !help")
    }
}



