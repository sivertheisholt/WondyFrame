exports.run = (bot, message, args1, args2, args3, warframeDropLocations, itemKeyWords) => {
    const warframe = require('../Handling/warframeHandler');
    const WorldState = require('warframe-worldstate-parser');

    function createEmbed(worldState, worldStateTimestamp) {
        const fortunaEmbed = {
            color: 0x0099ff,
            title: `Orb Vallis`,
            thumbnail: {
                url: "https://raw.githubusercontent.com/wfcd/warframe-items/development/data/img/orb-vallis-scene.png",
            },
            fields: [{
                name: "Current state",
                value: worldState.isWarm ? "Warm" : "Cold",
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
        return fortunaEmbed;
    }
    
    async function postResult() {
        try {
            message.channel.startTyping();
            const worldStateData = await warframe.data.getWorldState();
            const ws = new WorldState(JSON.stringify(worldStateData));
            const makeFortunaEmbed = await createEmbed(ws.vallisCycle, ws.timestamp);
            await message.channel.send({ embed: makeFortunaEmbed });
            message.channel.stopTyping();
        } catch(err) {
            message.channel.send(err);
            message.channel.stopTyping();
        }
    }
    postResult();
}