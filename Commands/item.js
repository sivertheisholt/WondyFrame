exports.run = (bot, message, itemName, args1, args2, warframeDropLocations, warframeRelicInfo) => {
    const Discord = require('discord.js');
    const warframe = require('../Handling/warframeHandler');
    const helperMethods = require('../Handling/helperMethods');

    function makeEmbedForPrime(relics, dropLocations, dropTableLastUpdated) {
        return new Promise((resolve, reject) => {
            if(relics == undefined) {
                reject("Sorry this item does not exist")
            }
            let isVaulted = true;
            for(relic of relics) {
                if(dropLocations.get(`${relic.tier} ${relic.relicName} Relic`) !== undefined) {
                    relic.vaulted = "No";
                    isVaulted = false;
                } else {
                    relic.vaulted = "Yes";
                }
            }
            const primeEmbed = {
                color: 0x0099ff,
                title: helperMethods.data.makeCapitalFirstLettersFromString(itemName),
                thumbnail: {
                    url: 'https://vignette.wikia.nocookie.net/warframe/images/a/a8/IvaraPrime.png',
                },
                fields: [],
                /* image: {
                    url: 'https://vignette.wikia.nocookie.net/warframe/images/a/a8/IvaraPrime.png',
                }, */
                timestamp: dropTableLastUpdated.modified,
                    footer: {
                        text: 'Drop tables updated:  '
                    },
            };
            for (relic of relics) {
                if(relic.state == "Intact") {
                    primeEmbed.fields.push({name: relic.tier + " " + relic.relicName, value: "Rarity: " + relic.rarity + "\n" + "Chance: " + relic.chance + " %" + "\n" + "Vaulted: " + relic.vaulted, inline: true,})
                }
            }

            if(!isVaulted) {
                for(relic of relics) {
                    if(relic.state == "Intact" && relic.vaulted == "No") {
                        let getDropLocations = dropLocations.get(`${relic.tier} ${relic.relicName} Relic`);
                        let sortedAfterChance = getTopThree(getDropLocations);
                        let counterMaxThree = 0;
                        primeEmbed.fields.push({name: '\u200B', value: `**Top 6 drop locations for: ${relic.tier} ${relic.relicName}**`, inline: false,});
                        for(location of sortedAfterChance) {
                            if(counterMaxThree == 6) {
                                break;
                            }
                            if(!location.isEvent) {
                                primeEmbed.fields.push({name: location.planet + " - " + location.node, value: "Type: " + location.gameMode + '\n' + "Rotation: " + location.rotation + '\n' + "Chance: " + location.chance + "%", inline: true,})
                                console.log(location);
                                counterMaxThree++;
                            }
                        }
                    }
                }
            }
            resolve(primeEmbed);
        });
    }
    function makeEmbedForNonPrime(dropLocations, dropTableLastUpdated) {
        return new Promise((resolve, reject) => {
            const nonPrimeEmbed = {
                color: 0x0099ff,
                title: helperMethods.data.makeCapitalFirstLettersFromString(itemName),
                thumbnail: {
                    url: 'https://vignette.wikia.nocookie.net/warframe/images/e/e0/Systems.png',
                },
                fields: [{
                    name: `\u200B`,
                    value: `**Top 12 drop locations**`,
                    inline: false,
                }],
                /* image: {
                    url: 'https://vignette.wikia.nocookie.net/warframe/images/e/e0/Systems.png',
                }, */
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
                nonPrimeEmbed.fields.push({name: (location.node !== null ? `${location.planet} - ${location.node}` : `${location.planet}`), value: "Type: " + location.gameMode + '\n' + (location.rotation !== null ? `Rotation: ${location.rotation} \n` : "") + (location.blueprintDropChance !== null ? `Chance: ${location.blueprintDropChance/100*location.chance} %` : `Chance: ${location.chance} %`) + "\n" + `Expected Runs: ${helperMethods.data.getExpectedRuns((location.blueprintDropChance !== null ? location.blueprintDropChance/100*location.chance : location.chance))}`, inline: true,})
                counter++
            }
            resolve(nonPrimeEmbed);
        })
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

    async function postResult() {
        try {
            const dropTableLastUpdated = await warframe.data.getBuildInfo();
            if(itemName.search("prime") !== -1) {
                //For prime items here
                const makeEmbedForPrimeResult = await makeEmbedForPrime(warframeRelicInfo.get(itemName), warframeDropLocations, dropTableLastUpdated);
                await message.channel.send({ embed: makeEmbedForPrimeResult });
            } else {
                //For non prime items here
                const getDropLocationsForItem = await warframeDropLocations.get(helperMethods.data.makeCapitalFirstLettersFromString(itemName));
                const readyTobeUsedData = await getTopNine(getDropLocationsForItem);
                const makeEmbedForNonPrimeResult = await makeEmbedForNonPrime(readyTobeUsedData, dropTableLastUpdated)
                message.channel.send({ embed: makeEmbedForNonPrimeResult });
            }
        } catch(err) {
            message.channel.send(err);
        }
    }
    postResult();
}