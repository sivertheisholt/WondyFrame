'use strict'

const warframe = require('../handling/warframeHandler');
const helperMethods = require('../handling/helperMethods');
const fetch = require('node-fetch');
const Discord = require("discord.js");
const logger = require('../logging/logger');

/**
 * Searches for item
 * @param {Object} commandData Data holder
 * @param commandData.type The relic type
 * @param commandData.name The relic name
 * @param commandData.refinement The relic refinement
 * @param commandData.warframeDropLocations Array of all drop locations
 * @returns {Promise<Object|String>} Discord interaction data
 */
 exports.run = (commandData) => {
    return makeResult(commandData);
}

async function makeResult(commandData) {
    try {
        //Get drop table update time
        const dropTableLastUpdated = await warframe.data.getBuildInfo();

        //Try to find item name
        const tryToFindKey = await helperMethods.data.searchForItemInMap(commandData.itemName, commandData.warframeDropLocations);

        //Check if drop location is found
        if(tryToFindKey == undefined) {
            throw `Sorry I can't find any drop locations for: ${commandData.itemName}`;
        }

        //Check if item search is prime or not
        if(commandData.itemName.search("prime") !== -1) {
            //Prime item
            const makeEmbedForPrimeResult = await createEmbedForPrime(tryToFindKey, commandData.warframeRelicInfo.get(tryToFindKey), commandData.warframeDropLocations, dropTableLastUpdated);
            return makeEmbedForPrimeResult;
        } else {
            //Non prime item
            //const getDropLocationsForItem = await commandData.warframeDropLocations.get(tryToFindKey);
            //const readyTobeUsedData = await getTopNine(getDropLocationsForItem);
            const makeEmbedForNonPrimeResult = await makeEmbedForNonPrime(tryToFindKey, readyTobeUsedData, dropTableLastUpdated)
            return makeEmbedForNonPrimeResult;
        }
    } catch(err) {
        return err;
    }
}

function createEmbedForPrime(itemName, relics, dropLocations, dropTableLastUpdated, showVaulted) {
    let buttonComponents = {
        type: 1,
        components: [
            {
                type: 2,
                label: "Previous page",
                style: 1,
                custom_id: "item_back_drops",
                disabled: true
            },
            {
                type: 2,
                label: "Next page",
                style: 1,
                custom_id: "item_next_drops",
                disabled: false
            },
            {
                type: 2,
                label: "Previous relic",
                style: 1,
                custom_id: "item_back_relic",
                disabled: true
            },
            {
                type: 2,
                label: "Next relic",
                style: 1,
                custom_id: "item_next_relic",
                disabled: false
            }
        ]
    }
    let isVaulted = true;

    //Check if vaulted - check for drop locations
    for(const relic of relics) {
        if(dropLocations.get(`${(relic.tier).toLowerCase()} ${(relic.relicName).toLowerCase()} relic`) !== undefined) {
            relic.vaulted = "No";
            isVaulted = false;
        } else {
            relic.vaulted = "Yes";
        }
    }

    //Create base embed
    let primeEmbed = new Discord.MessageEmbed()
                        .setColor(0x0099ff)
                        .setTitle(helperMethods.data.makeCapitalFirstLettersFromString(itemName))
                        .setTimestamp(dropTableLastUpdated.modified)
                        .setFooter('Drop tables updated: ')
    
    //Check if vaulted
    if(isVaulted) {
        primeEmbed.setDescription("**This item is vaulted or Digital Extreme didn't update the drop table yet.**");
    }

    //Relics
    primeEmbed.addField('\u200B', `**Relics - Relic 1 of ${relics.length}**`, false)

    let currentRelic;

    //Add relic to embed
    for (const relic of relics) {
        
        //Check if relic is intact refinement
        if(relic.state != "Intact") continue;

        //Add relic
        primeEmbed.addField(`${relic.tier} ${relic.relicName}`,
                            `Rarity: ${relic.rarity} 
                            \nChance: ${(relic.chance).toFixed(3)}%
                            \nExpected Runs: ${helperMethods.data.getExpectedRuns((relic.chance))}
                            \nVaulted: ${relic.vaulted}`,
                            true)
        currentRelic = relic;
        break;
    }

    //Add drop locations
    if(!isVaulted) {
        primeEmbed.addField('\u200B', `**Drop locations - Page 1 of ${relics.length} **`, false)
        let getDropLocations = dropLocations.get(`${(currentRelic.tier).toLowerCase()} ${(currentRelic.relicName).toLowerCase()} relic`);
        let sortedAfterChance = sortByChance(getDropLocations);
        let counterMaxSix = 0;
        for(const location of sortedAfterChance) {
            if(counterMaxSix == 6) break;
            if(location.isEvent) continue;
            if(relics.vaulted == "Yes") continue;
            primeEmbed.addField(location.planet + " - " + location.node,
                    "Type: " + location.gameMode + '\n' + "Rotation: " + location.rotation + '\n' + "Chance: " + (location.chance).toFixed(3) + "%" + "\n" + `Expected Runs: ${helperMethods.data.getExpectedRuns((location.chance))}`,
                    true)
            counterMaxSix++;
        }
    }
    return {content: undefined, embeds: [primeEmbed], components: [buttonComponents]}
}

/**
 * Check if drops exist and sorts by chance
 * @param {Array} dropLocations 
 * @returns {String|Array} Vaulted if undefined, else drop locations sorted
 */
 function sortByChance(dropLocations) {
    //Check if drop locations exist
    if(dropLocations == undefined) {
        return "Vaulted";
    } 

    //Sort data
    dropLocations.sort((a, b) => {
        if(a.blueprintDropChance == null) {
            return b.chance - a.chance;
        } else {
            return (b.blueprintDropChance/100*b.chance) - (a.blueprintDropChance/100*a.chance);
        }
    });

    //Return sorted drops
    return dropLocations;
}





    async function makeEmbedForNonPrime(itemName, dropLocations, dropTableLastUpdated) {
        let buttonComponents = {
            type: 1,
            components: [
                {
                    type: 2,
                    label: "Previous page",
                    style: 1,
                    custom_id: "item_back_drops",
                    disabled: true
                },
                {
                    type: 2,
                    label: "Next page",
                    style: 1,
                    custom_id: "item_next_drops",
                    disabled: false
                }
            ]
        }


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