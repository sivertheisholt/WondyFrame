exports.run = (bot, message, itemName, args1, args2, warframeDropLocations, warframeRelicInfo) => {
    const Discord = require('discord.js');
    const warframe = require('../Handling/warframeHandler');
    const helperMethods = require('../Handling/helperMethods');
    
    function makeEmbed(relicInfo, dropLocations) {
        return new Promise((resolve, reject) => {

        });
    }

    function makeEmbedForPrime(relics, dropLocations) {
        return new Promise((resolve, reject) => {
            if(relics == undefined) {
                reject("Sorry this item does not exist")
            }
            for(x of relics ) {
                //console.log(dropLocations.get(x.tier + " " + x.relicName))
                if(dropLocations.get(x.tier + " " + x.relicName) !== undefined) {
                    x.vaulted = "No";
                } else {
                    x.vaulted = "Yes";
                }
            }
            const primeEmbed = {
                color: 0x0099ff,
                title: helperMethods.data.makeCapitalFirstLettersFromString(itemName),
                fields: [],
                image: {
                    url: 'https://vignette.wikia.nocookie.net/warframe/images/f/f8/GenericWeaponPrimeBlade.png',
                },
                timestamp: new Date(),
                footer: {
                    text: 'Date: '
                },
            };
            for (relic of relics) {
                if(relic.state == "Intact") {
                    primeEmbed.fields.push({name: relic.tier + " " + relic.relicName, value: "Rarity: " + relic.rarity + "\n" + "Chance: " + relic.chance + " %" + "\n" + "Vaulted: " + relic.vaulted, inline: true,})
                }
            }
            resolve(primeEmbed);
        });
    }
    function makeEmbedForNonPrime(dropLocations) {
        return new Promise((resolve, reject) => {
            const nonPrimeEmbed = {
                color: 0x0099ff,
                title: helperMethods.data.makeCapitalFirstLettersFromString(itemName),
                fields: [{
                    name: `\u200B`,
                    value: `**Top 12 drop locations**`,
                    inline: false,
                }],
                image: {
                    url: 'https://vignette.wikia.nocookie.net/warframe/images/e/e0/Systems.png',
                },
                timestamp: new Date(),
                footer: {
                    text: 'Date: '
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

    async function postResult() {
        try {
            if(itemName.search("prime") !== -1) {
                //For prime items here
                const makeEmbedForPrimeResult = await makeEmbedForPrime(warframeRelicInfo.get(itemName), warframeDropLocations);
                await message.channel.send({ embed: makeEmbedForPrimeResult });
            } else {
                //For non prime items here
                const getDropLocationsForItem = await warframeDropLocations.get(helperMethods.data.makeCapitalFirstLettersFromString(itemName));
                const readyTobeUsedData = await getTopNine(getDropLocationsForItem);
                const makeEmbedForNonPrimeResult = await makeEmbedForNonPrime(readyTobeUsedData)
                message.channel.send({ embed: makeEmbedForNonPrimeResult });
            }
        } catch(err) {
            message.channel.send(err);
        }
    }
    postResult();
}