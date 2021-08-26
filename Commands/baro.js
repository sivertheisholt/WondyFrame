const warframe = require('../Handling/warframeHandler');
const WorldState = require('warframe-worldstate-parser');
const helperMethods = require('../Handling/helperMethods');
const Discord = require("discord.js");
const logger = require('../logging/logger');

let buttonComponents = {
    type: 1,
    components: [
        {
            type: 2,
            label: "Back",
            style: 1,
            custom_id: "click_back",
            disabled: true
        },
        {
            type: 2,
            label: "Next",
            style: 1,
            custom_id: "click_next",
            disabled: false
        }
    ]
}

exports.run = () => {
    return makeResult();
}

async function makeResult() {
    try {
        //Getting current world state
        const worldStateData = await warframe.data.getWorldState();
        
        //Parse data to WorldState object
        const ws = new WorldState(JSON.stringify(worldStateData));
        
        //Create the embed
        const makeBaroEmbed = createEmbed(ws.voidTrader, ws.timestamp);
        return makeBaroEmbed;
    } catch(err) {
        logger.error(err);
        return 'Something unexpected happen when trying to run the command!';
    }
}

function createEmbed(worldState, worldStateTimestamp) {
    let baroEmbed1 = new Discord.MessageEmbed()
                        .setTitle(`Baro Ki'Teer`)
                        .setColor(0x0099ff)
                        .setThumbnail("https://raw.githubusercontent.com/wfcd/warframe-items/development/data/img/baro-ki'teer-glyph.png")
                        .setTimestamp(worldStateTimestamp)
                        .setFooter('World state updated:');

    if(worldState.active) {
        //Set default content to embed
        baroEmbed1.addField("Location", worldState.location, true)
            .addField("Baro will leave in", worldState.endString, true)
            .addField('\u200B', '\u200B', true)
            .addField('\u200B', '**Inventory - Page 1 of 2**');

        //Push inventory to embed
        let counter = 0;
        for(const item of worldState.inventory) {
            if(counter >= 15) break;
            baroEmbed1.addField(item.item, `Ducats: ${item.ducats} \n Credits: ${(helperMethods.data.makeNumberWithCommas(item.credits))}`, true);
            counter++;
        }
        return {content: undefined, embeds: [baroEmbed1], components: [buttonComponents]}
    } else {
        //Create embed for arrival time
        baroEmbed1.addField('Location', worldState.location, false)
        .addField('Baro will arrive in', worldState.startString, false)
        return {content: undefined, embeds: [baroEmbed1]}
    }
}