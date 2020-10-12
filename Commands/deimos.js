exports.run = (bot, message, args1, args2, args3, warframeDropLocations, itemKeyWords) => {
    const warframe = require('../Handling/warframeHandler');
    const WorldState = require('warframe-worldstate-parser');
    const helperMethods = require('../Handling/helperMethods');

    async function createEmbed(worldState, worldStateTimestamp) {
        let expiry = new Date(worldState.expiry);
        let activation = new Date();
        var seconds = (expiry.getTime() - activation.getTime()) / 1000;
        const cambionEmbed = {
            color: 0x0099ff,
            title: `Cambion Drift`,
            thumbnail: {
                url: "https://raw.githubusercontent.com/wfcd/warframe-items/development/data/img/heart-of-deimos.png",
            },
            fields: [{
                name: "Current state",
                value: await helperMethods.data.makeCapitalFirstLettersFromString(worldState.active),
                inline: false,
            },
            {
                name: "Time left",
                value: await helperMethods.data.toHHMMSS(seconds),
                inline: false,
            }],
            timestamp: worldStateTimestamp,
                footer: {
                    text: 'World state updated:  '
                },
        };
        return cambionEmbed;
    }
    
    async function postResult() {
        try {
            message.channel.startTyping();
            const worldStateData = await warframe.data.getWorldState();
            const ws = new WorldState(JSON.stringify(worldStateData));
            const makeCambionEmbed = await createEmbed(ws.cambionCycle, ws.timestamp);
            await message.channel.send({ embed: makeCambionEmbed });
            message.channel.stopTyping();
        } catch(err) {
            message.channel.send(err);
            message.channel.stopTyping();
        }
    }
    postResult();
}