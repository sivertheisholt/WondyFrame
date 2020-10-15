exports.run = (bot, message, itemName, showVaulted, args2, warframeDropLocations, warframeRelicInfo) => {
    const Discord = require('discord.js');
    const warframe = require('../Handling/warframeHandler');
    const helperMethods = require('../Handling/helperMethods');
    const fetch = require('node-fetch');

    async function makeEmbedForPrime(itemName, relics, dropLocations, dropTableLastUpdated) {
        if(relics == undefined) {
            throw (`Sorry I can't find any drop locations for: ${itemName}`);
        }
        if(showVaulted == undefined) {
            showVaulted = "no";
        }
        let isVaulted = true;
        for(relic of relics) {
            if(dropLocations.get(`${(relic.tier).toLowerCase()} ${(relic.relicName).toLowerCase()} relic`) !== undefined) {
                relic.vaulted = "No";
                isVaulted = false;
            } else {
                relic.vaulted = "Yes";
            }
        }
        const primeEmbed = {
            color: 0x0099ff,
            title: await helperMethods.data.makeCapitalFirstLettersFromString(itemName),
            thumbnail: {
                url: await getImagePrime(itemName),
            },
            description: "",
            fields: [],
            timestamp: dropTableLastUpdated.modified,
                footer: {
                    text: 'Drop tables updated:  '
                },
        };

        //Adds relics to find the item in
        if(!isVaulted) {
            for (relic of relics) {
                if(relic.state == "Intact") {
                    if(showVaulted == "yes") {
                        primeEmbed.fields.push({name: relic.tier + " " + relic.relicName, value: "Rarity: " + relic.rarity + "\n" + "Chance: " + (relic.chance).toFixed(3) + "%" + "\n" + `Expected Runs: ${helperMethods.data.getExpectedRuns((relic.chance))}` + "\n" + "Vaulted: " + relic.vaulted, inline: true,});
                    } else {
                        if(relic.vaulted == "No") {
                            primeEmbed.fields.push({name: relic.tier + " " + relic.relicName, value: "Rarity: " + relic.rarity + "\n" + "Chance: " + (relic.chance).toFixed(3) + "%" + "\n" + `Expected Runs: ${helperMethods.data.getExpectedRuns((relic.chance))}` + "\n" + "Vaulted: " + relic.vaulted, inline: true,});
                        }
                    }
                }
            }
        } else {
            primeEmbed.description = "**This item is vaulted or Digital Extreme didn't update the drop table yet.**";
            for (relic of relics) {
                if(relic.state == "Intact") {
                    primeEmbed.fields.push({name: relic.tier + " " + relic.relicName, value: "Rarity: " + relic.rarity + "\n" + "Chance: " + (relic.chance).toFixed(3) + "%" + "\n" + `Expected Runs: ${helperMethods.data.getExpectedRuns((relic.chance))}` + "\n" + "Vaulted: " + relic.vaulted, inline: true,});
                }
            }
        }
        
        //Adds drop locations
        if(!isVaulted) {
            for(relic of relics) {
                if(relic.state == "Intact" && relic.vaulted == "No") {
                    let getDropLocations = dropLocations.get(`${(relic.tier).toLowerCase()} ${(relic.relicName).toLowerCase()} relic`);
                    let sortedAfterChance = await getTopThree(getDropLocations);
                    let counterMaxThree = 0;
                    primeEmbed.fields.push({name: '\u200B', value: `**Top 6 drop locations for: ${relic.tier} ${relic.relicName}**`, inline: false,});
                    for(location of sortedAfterChance) {
                        if(counterMaxThree == 6) {
                            break;
                        }
                        if(!location.isEvent) {
                            primeEmbed.fields.push({name: location.planet + " - " + location.node, value: "Type: " + location.gameMode + '\n' + "Rotation: " + location.rotation + '\n' + "Chance: " + (location.chance).toFixed(3) + "%" + "\n" + `Expected Runs: ${helperMethods.data.getExpectedRuns((location.chance))}`, inline: true,});
                            counterMaxThree++;
                        }
                    }
                }
            }
        }
        return primeEmbed;
    }
    async function makeEmbedForNonPrime(itemName, dropLocations, dropTableLastUpdated) {
        const nonPrimeEmbed = {
            color: 0x0099ff,
            title: await helperMethods.data.makeCapitalFirstLettersFromString(itemName),
            thumbnail: {
                url: await getImageUrlNonPrime(itemName),
            },
            fields: [{
                name: `\u200B`,
                value: `**Top 12 drop locations**`,
                inline: false,
            }],
            timestamp: dropTableLastUpdated.modified,
                footer: {
                    text: 'Drop tables updated:  '
                },
        };
        let counter = 0;
        for(location of dropLocations) {
            if(counter == 12) {
                break;
            }
            if(location.gameMode == "Purchasable") {
                nonPrimeEmbed.fields.push({name: `Shop - ${location.node}`, value: "Type: " + location.gameMode, inline: true,});
            } else {
                nonPrimeEmbed.fields.push({name: (location.node !== null ? `${location.planet} - ${location.node}` : `${location.planet}`), value: "Type: " + location.gameMode + '\n' + (location.rotation !== null ? `Rotation: ${location.rotation} \n` : "") + (location.blueprintDropChance !== null ? `Chance: ${(location.blueprintDropChance/100*location.chance).toFixed(3)}%` : `Chance: ${location.chance.toFixed(3)}%`) + "\n" + `Expected Runs: ${helperMethods.data.getExpectedRuns((location.blueprintDropChance !== null ? location.blueprintDropChance/100*location.chance : location.chance))}`, inline: true,});
            }
            
            counter++;
        }
        return nonPrimeEmbed;
    }

    function getTopNine(dropLocations) {
        if(dropLocations == undefined) {
            return (`Sorry I can't find any drop locations for: ${itemName}`);
        } else {
            dropLocations.sort((a, b) => {
                if(a.blueprintDropChance == null) {
                    return b.chance - a.chance;
                } else {
                    return (b.blueprintDropChance/100*b.chance) - (a.blueprintDropChance/100*a.chance);
                }
            });
            return dropLocations;
        }
    }

    function getTopThree(dropLocations) {
        if(dropLocations == undefined) {
            return "No drop locations"
        } else {
            dropLocations.sort((a, b) => {
                return b.chance - a.chance
            });
            return dropLocations;
        }
    }

    function imageExists(url){
        return fetch(url).then(res=>{
            if(res.status == 200) {
                return true;
            } else {
                return false;
            }
        })
    }

    async function getImagePrime(itemName) {
        let counterStop = 3;
        let newName = itemName.split(' ');
        let baseUrl = `https://cdn.warframestat.us/img/`;
        let counter = 0;
        if(itemName.search("blueprint") !== -1) {
            counterStop = 3;
        } else {
            counterStop = 2;
        }
        for(const parts of newName) {
            if(counter == counterStop) {
                break;
            }
            baseUrl += parts + "-";
            counter++;
        }
        baseUrl = baseUrl.slice(0, -1);
        const test = await imageExists(baseUrl + ".png");
        if(test) {
            return baseUrl + ".png";
        } else {
            return baseUrl + ".jpg"
        }
    }

    async function getImageUrlNonPrime(itemName) {
        let counterStop = 3;
        if(itemName.search("blueprint") !== -1) {
            counterStop = 1;
        }
        let newName = itemName.split(' ');
        let baseUrl = `https://cdn.warframestat.us/img/`
        let counter = 0;
        for(const parts of newName) {
            if(counter == counterStop)  {
                break;
            }
            baseUrl += parts + "-";
            counter++;
        }
        baseUrl = baseUrl.slice(0, -1);

        const test = await imageExists(baseUrl + ".png");
        if(test) {
            return baseUrl + ".png";
        } else {
            return baseUrl + ".jpg"
        }
    }
    
    async function postResult() {
        try {
            message.channel.startTyping();
            const dropTableLastUpdated = await warframe.data.getBuildInfo();
            if(itemName.search("prime") !== -1) {
                //For prime items here
                const tryToFindKey = await helperMethods.data.searchForItemInMap(itemName, warframeRelicInfo);
                if(tryToFindKey == undefined) {
                    message.channel.stopTyping();
                    throw `Sorry I can't find any drop locations for: ${itemName}`;
                }
                const makeEmbedForPrimeResult = await makeEmbedForPrime(tryToFindKey, warframeRelicInfo.get(tryToFindKey), warframeDropLocations, dropTableLastUpdated);
                await message.channel.send({ embed: makeEmbedForPrimeResult });
                message.channel.stopTyping();
            } else {
                //For non prime items here
                const tryToFindKey = await helperMethods.data.searchForItemInMap(itemName, warframeDropLocations);
                if(tryToFindKey == undefined) {
                    message.channel.stopTyping();
                    throw `Sorry I can't find any drop locations for: ${itemName}`;
                }
                const getDropLocationsForItem = await warframeDropLocations.get(tryToFindKey);
                const readyTobeUsedData = await getTopNine(getDropLocationsForItem);
                const makeEmbedForNonPrimeResult = await makeEmbedForNonPrime(tryToFindKey, readyTobeUsedData, dropTableLastUpdated)
                await message.channel.send({ embed: makeEmbedForNonPrimeResult });
                message.channel.stopTyping();
            }
        } catch(err) {
            message.channel.send(err);
            message.channel.stopTyping();
        }
    }
    if(itemName !== undefined) {
        postResult();
    } else {
        message.channel.send("You didn't write the command correctly. Please check WF.Help");
    }
}