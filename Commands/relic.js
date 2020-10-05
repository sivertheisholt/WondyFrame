exports.run = (bot, message, args, args2, args3, warframeInfoSorted) => {
    const Discord = require('discord.js');
    const warframe = require('../Handling/warframeHandler');
    
    function makeEmbed(relicInfo, dropLocations) {
        return new Promise((resolve, reject) => {
            /* const pictureRelic = 
                args.charAt(0).toUpperCase() + args.slice(1) == "Axi" ? "Axi.png" : 
                args.charAt(0).toUpperCase() + args.slice(1) == "Neo" ? "Neo.png" : 
                args.charAt(0).toUpperCase() + args.slice(1) == "Meso" ? "Meso.png" : 
                args.charAt(0).toUpperCase() + args.slice(1) == "Lith" ? "Lith.png" : "Undefined"; */
            if(args3 !== undefined) {
                args3 = args3.charAt(0).toUpperCase() + args3.slice(1)
                if(args3 !== "Radiant" && args3 !== "Flawless" && args3 !== "Exceptional" && args3 !== "Intact") {
                    reject("Please recheck arguments...")
                } else {

                    const relicEmbed = {
                        color: 0x0099ff,
                        title: relicInfo.tier + " " + relicInfo.name + " " + args3,
                        fields: [],
                        image: {
                            url: 'https://vignette.wikia.nocookie.net/warframe/images/1/12/VoidProjectionsBronzeD.png/revision/latest/scale-to-width-down/350?cb=20160709035928',
                        },
                        timestamp: new Date(),
                        footer: {
                            text: 'Date: '
                        },
                    };

                    for (x in relicInfo.rewards[args3]) {
                        relicEmbed.fields.push({name: relicInfo.rewards[args3][x].itemName, value: "Rarity: " + relicInfo.rewards[args3][x].rarity + '\n' + "Chance: " + relicInfo.rewards[args3][x].chance + " %", inline: true,})
                    }
                    if(dropLocations !== "Vaulted") {
                            relicEmbed.fields.push({name: `\u200B`, value: `**Top 9 drop locations**`, inline: false,})
                            let counter = 0;
                        for (x in dropLocations) {
                            if(counter == 9) {
                                break;
                            }
                            relicEmbed.fields.push({name: dropLocations[x].planet + " - " + dropLocations[x].node, value: "Type: " + dropLocations[x].gameMode + '\n' + "Rotation: " + dropLocations[x].rotation + '\n' + "Chance: " + dropLocations[x].chance + " %", inline: true,})
                            counter++;
                        }
                    } else {
                        relicEmbed.fields.push({name: '\u200B', value: `**This relic is either vaulted, Digital Extreme didn't update the drop table yet or this item don't have any drop locations**`, inline: false})
                    }
                    
                    resolve(relicEmbed);
                }
            } else {
                const relicEmbed = {
                    color: 0x0099ff,
                    title: relicInfo.tier + " " + relicInfo.name + " Intact",
                    fields: [],
                    image: {
                        url: 'https://vignette.wikia.nocookie.net/warframe/images/1/12/VoidProjectionsBronzeD.png/revision/latest/scale-to-width-down/350?cb=20160709035928',
                    },
                    timestamp: new Date(),
                    footer: {
                        text: 'Date: '
                    },
                };

                for (x in relicInfo.rewards.Intact) {
                    relicEmbed.fields.push({name: relicInfo.rewards.Intact[x].itemName, value: "Rarity: " + relicInfo.rewards.Intact[x].rarity + '\n' + "Chance: " + relicInfo.rewards.Intact[x].chance + " %", inline: true,})
                }
                if(dropLocations !== "Vaulted") {
                        relicEmbed.fields.push({name: `\u200B`, value: `**Top 9 drop locations**`, inline: false,})
                        let counter = 0;
                    for (x in dropLocations) {
                        if(counter == 9) {
                            break;
                        }
                        relicEmbed.fields.push({name: dropLocations[x].planet + " - " + dropLocations[x].node, value: "Type: " + dropLocations[x].gameMode + '\n' + "Rotation: " + dropLocations[x].rotation + '\n' + "Chance: " + dropLocations[x].chance + " %", inline: true,})
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
            const relicInfo = await warframe.data.getRelicInfo(args.charAt(0).toUpperCase() + args.slice(1), args2.charAt(0).toUpperCase() + args2.slice(1) + ".json");
            console.log('Searching for relic...');
            let readyTobeUsedData;
            if(args3 !== undefined) {
                readyTobeUsedData = await getTopNine(warframeInfoSorted.get(relicInfo.tier + " " + relicInfo.name + " Relic " + "("+args3.charAt(0).toUpperCase() + args3.slice(1)+")"));
            } else {
                readyTobeUsedData = await getTopNine(warframeInfoSorted.get(relicInfo.tier + " " + relicInfo.name + " Relic"));
            }
            const makeEmbedForRelic = await makeEmbed(relicInfo, readyTobeUsedData);
            console.log('Making embed...');
            await message.channel.send({ embed: makeEmbedForRelic });
        } catch (err) {
            message.channel.send(err);
        }
    }

    if(args !== undefined && args2 !== undefined) {
        postResult();
    } else {
        message.channel.send("You didn't write the command correctly. Please check !help")
    }
}



