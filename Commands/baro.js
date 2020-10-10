exports.run = (bot, message, args1, args2, args3, warframeDropLocations, itemKeyWords) => {
    const warframe = require('../Handling/warframeHandler');
    const WorldState = require('warframe-worldstate-parser');
    const helperMethods = require('../Handling/helperMethods');

    async function createEmbed(worldState, dropTableLastUpdated) {
        const baroEmbed1 = {
            color: 0x0099ff,
            title: `Baro Ki'Teer`,
            thumbnail: {
                url: "https://raw.githubusercontent.com/wfcd/warframe-items/development/data/img/baro-ki'teer-glyph.png",
            },
            fields: [],
        };
        const baroEmbed2 = {
            color: 0x0099ff,
            thumbnail: {
                url: "https://raw.githubusercontent.com/wfcd/warframe-items/development/data/img/baro-ki'teer-glyph.png",
            },
            fields: [],
            timestamp: dropTableLastUpdated.modified,
            footer: {
                text: 'Drop tables updated:  '
            },
        };
        
        let counter = 0;
        if(worldState.active) {
            baroEmbed1.fields.push({name: "Location", value: worldState.location, inline: true,});
            baroEmbed1.fields.push({name: "Baro will leave in", value: worldState.endString, inline: true,});
            baroEmbed1.fields.push({name: '\u200B', value: '\u200B', inline: true,});
            for(const inventory of worldState.inventory) {
                if(counter >= 15) {
                    baroEmbed2.fields.push({name: inventory.item, value: `Ducats: ${inventory.ducats} \n Credits: ${(helperMethods.data.makeNumberWithCommas(inventory.credits))}`, inline: true,});
                } else {
                    baroEmbed1.fields.push({name: inventory.item, value: `Ducats: ${inventory.ducats} \n Credits: ${(helperMethods.data.makeNumberWithCommas(inventory.credits))}`, inline: true,});
                    counter++;
                }
            }
        } else {
            baroEmbed1.fields.push({name: "Location", value: worldState.location, inline: false,});
            baroEmbed1.fields.push({name: "Baro will arrive in", value: worldState.startString, inline: false,});
        }
        return [baroEmbed1, baroEmbed2];
    }
    
    async function postResult() {
        message.channel.startTyping();
        const dropTableLastUpdated = await warframe.data.getBuildInfo();
        const worldStateData = await warframe.data.getWorldState();
        const ws = new WorldState(JSON.stringify(worldStateData));
        const makeBaroEmbed = await createEmbed(ws.voidTrader, dropTableLastUpdated);
        await message.channel.send({ embed: makeBaroEmbed[0] });
        await message.channel.send({ embed: makeBaroEmbed[1] });
        message.channel.stopTyping();
    }
    postResult();
}