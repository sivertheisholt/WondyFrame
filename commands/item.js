'use strict'

const warframe = require('../handling/warframeHandler');
const helperMethods = require('../handling/helperMethods');
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

/**
 * Creates the result that will be returned.
 * @returns {Promise<Object|String>}
 */
async function makeResult(commandData) {
    try {

        //Get drop table update time
        const dropTableLastUpdated = await warframe.data.getBuildInfo();

        //Try to find item name
        const tryToFindKey = await helperMethods.data.searchForItemInMap(commandData.item, commandData.warframeRelicInfo);

        //Check if drop location is found
        if(tryToFindKey == undefined) {
            throw `Sorry I can't find any drop locations for: ${commandData.item}`;
        }

        //Check if item search is prime or not
        if(tryToFindKey.search("prime") !== -1) {
            //Prime item
            const makeEmbedForPrimeResult = createEmbedForPrime(tryToFindKey, commandData.warframeRelicInfo.get(tryToFindKey), commandData.warframeDropLocations, dropTableLastUpdated.modified, commandData.vaulted);
            return makeEmbedForPrimeResult;
        } else {
            //Non prime item
            const makeEmbedForNonPrimeResult = makeEmbedForNonPrime(tryToFindKey, sortByChance(commandData.warframeDropLocations.get(tryToFindKey)), dropTableLastUpdated.modified)
            return makeEmbedForNonPrimeResult;
        }
    } catch(err) {
        return err;
    }
}

/**
 * Creates the interaction data for prime item
 * @param {String} itemName The name of the item
 * @param {Array} relics The relics for the item
 * @param {Object} dropLocations The drop locations
 * @param {Number} dropTableLastUpdated When drop tables was last updated
 * @param {String} showVaulted To show vaulted or not
 * @returns {Object} Interaction data
 */
function createEmbedForPrime(itemName, relics, dropLocations, dropTableLastUpdated, showVaulted) {
    showVaulted = showVaulted != undefined ? showVaulted : false
    let isVaulted = true;
    let relicsToUse = [];
    let currentRelic;
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
    let selectMenuComponents = {
        type: 1, 
        components: [
            {
                type: 3,
                custom_id: "relic_menu",
                options:[
                    {
                        label: "Rogue",
                        value: "rogue",
                        description: "Sneak n stab",
                    },
                    {
                        label: "test",
                        value: "test2",
                        description: "blabla",
                    },
                ],
                placeholder: "",
                min_values: 1,
                max_values: 2
            },
        ]
    }

    //Check if vaulted - check for drop locations
    for(let relic of relics) {
        if(relic.state != "Intact") continue;
        if(dropLocations.get(`${(relic.tier).toLowerCase()} ${(relic.relicName).toLowerCase()} relic`) !== undefined) {
            relic.vaulted = "No";
            isVaulted = false;
            relicsToUse.push(relic);
        } else {
            relic.vaulted = "Yes";
            relicsToUse.push(relic);
        }
    }

    //Create base embed
    let primeEmbed = new Discord.MessageEmbed()
                        .setColor(0x0099ff)
                        .setTitle(helperMethods.data.makeCapitalFirstLettersFromString(itemName))
                        .setTimestamp(dropTableLastUpdated)
                        .setFooter('Drop tables updated: ')
    
    //Check if vaulted
    if(isVaulted) {
        primeEmbed.setDescription("**This item is vaulted or Digital Extreme didn't update the drop table yet.**");
    }

    //Add relic to embed
    for (const relic of relicsToUse) {
        
        //Check if relic is intact refinement
        if(relic.state != "Intact") continue;

        //Add relic
        primeEmbed.addField(`${relic.tier} ${relic.relicName}`,
                            `Rarity: ${relic.rarity}\nChance: ${(relic.chance).toFixed(3)}%\nExpected Runs: ${helperMethods.data.getExpectedRuns((relic.chance))}\nVaulted: ${relic.vaulted}`,
                            true)
        currentRelic = relic;
        if(!isVaulted) break;
    }
    if(relicsToUse.length % 2 != 0) {
        primeEmbed.addField('\u200B', '\u200B', true);
    }

    //Add drop locations
    if(!isVaulted) {
        //Add drop locations for first page
        primeEmbed.addField('\u200B', `**Drop locations - Page 1 of ${relics.length} **`, false)
        let getDropLocations = dropLocations.get(`${(currentRelic.tier).toLowerCase()} ${(currentRelic.relicName).toLowerCase()} relic`);
        let sortedAfterChance = sortByChance(getDropLocations);
        let counterMaxSix = 0;

        if(currentRelic.vaulted === "No") {
             //Loop over drop locations
            for(const location of sortedAfterChance) {
                if(counterMaxSix == 6) break;
                if(location.isEvent) continue;
                primeEmbed.addField(location.planet + " - " + location.node,
                        "Type: " + location.gameMode + '\n' + "Rotation: " + location.rotation + '\n' + "Chance: " + (location.chance).toFixed(3) + "%" + "\n" + `Expected Runs: ${helperMethods.data.getExpectedRuns((location.chance))}`,
                        true)
                counterMaxSix++;
            }
        } else {
            primeEmbed.addField('\u200B', `**This relic is either vaulted, Digital Extreme didn't update the drop table yet or this item don't have any drop locations**`,false)
        }
    }
    return {content: undefined, embeds: [primeEmbed], components: [selectMenuComponents, buttonComponents]}
}


/**
 * Sort relics by vaulted
 * @param {Array} relics 
 * @returns {Array} Sorted array - Unvaulted first
 */
function sortRelicsByVaulted(relics) {
    //Sort data
    relics.sort((a, b) => {
        if(a.vaulted == null) {
            return b.vaulted - a.vaulted;
        } else {
            return b.vaulted - b.vaulted;
        }
    });

    return relics;
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
/**
 * Creates the interaction for non prime item
 * @param {String} itemName The item name
 * @param {Array|String} dropLocations The drop locations
 * @param {Number} dropTableLastUpdated When drop tables was last updated
 * @returns {Object} Interaction data 
 */
function makeEmbedForNonPrime(itemName, dropLocations, dropTableLastUpdated,) {
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

    //Create base embed
    let embed = new Discord.MessageEmbed()
        .setColor(0x0099ff)
        .setTitle(helperMethods.data.makeCapitalFirstLettersFromString(itemName))
        .setTimestamp(dropTableLastUpdated)
        .setFooter('Drop tables updated: ')
    
    let counter = 0;
    for(const location of dropLocations) {
        if(counter == 12) break;

        if(location.gameMode == "Purchasable") {
            embed.addField(`Shop - ${location.node}`, "Type: " + location.gameMode, true)
        } else {
            embed.addField((location.node !== null ? `${location.planet} - ${location.node}` : `${location.planet}`), "Type: " + location.gameMode + '\n' + (location.rotation !== null ? `Rotation: ${location.rotation} \n` : "") + (location.blueprintDropChance !== null ? `Chance: ${(location.blueprintDropChance/100*location.chance).toFixed(3)}%` : `Chance: ${location.chance.toFixed(3)}%`) + "\n" + `Expected Runs: ${helperMethods.data.getExpectedRuns((location.blueprintDropChance !== null ? location.blueprintDropChance/100*location.chance : location.chance))}`, true)
        }
        counter++;
    }
    return {content: undefined, embeds: [embed], components: [buttonComponents]}
}