exports.run = (bot, message, args1, args2, args3, warframeDropLocations, itemKeyWords) => {
    const warframe = require('../Handling/warframeHandler');
    const WorldState = require('warframe-worldstate-parser');

    function createEmbed(worldState, worldStateTimestamp) {
        const cetusEmbed = {
            color: 0x0099ff,
            title: `Cetus`,
            thumbnail: {
                url: "https://raw.githubusercontent.com/wfcd/warframe-items/development/data/img/plains-of-eidolon-scene.png",
            },
            fields: [{
                name: "Current state",
                value: worldState.isDay ? "Day" : "Night",
                inline: false,
            },
            {
                name: "Time left",
                value: worldState.timeLeft,
                inline: false,
            }],
            timestamp: worldStateTimestamp,
                footer: {
                    text: 'World state updated:  '
                },
        };
        return cetusEmbed;
    }
    
    async function postResult() {
        try {
            message.channel.startTyping();
            const worldStateData = await warframe.data.getWorldState();
            const ws = new WorldState(JSON.stringify(worldStateData));
            const makeCetusEmbed = await createEmbed(ws.cetusCycle, ws.timestamp);
            await message.channel.send({ embed: makeCetusEmbed });
            message.channel.stopTyping();
        } catch(err) {
            message.channel.send(err);
            message.channel.stopTyping();
        }
    }
    postResult();
}