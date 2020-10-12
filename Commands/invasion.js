exports.run = (bot, message, args1, args2, args3, warframeDropLocations, itemKeyWords) => {
    const warframe = require('../Handling/warframeHandler');
    const WorldState = require('warframe-worldstate-parser');

    function createEmbed(worldState, dropTableLastUpdated) {
        const invasionsEmbed = {
            color: 0x0099ff,
            title: `Invasions`,
            thumbnail: {
                url: "https://vignette.wikia.nocookie.net/warframe/images/2/26/InvasionSplash.png",
            },
            fields: [],
            timestamp: dropTableLastUpdated.modified,
                footer: {
                    text: 'Drop tables updated:  '
                },
        };

        for(const x of worldState) {
            if(!x.completed) {
                invasionsEmbed.fields.push({name: `\u200B`, value: `**${x.node}**`, inline: false});
                invasionsEmbed.fields.push({name: x.attackingFaction, value: x.attackerReward.asString == "" ? "No reward" : x.attackerReward.asString, inline: true});
                invasionsEmbed.fields.push({name: x.defendingFaction, value: x.defenderReward.asString == "" ? "No reward" : x.defenderReward.asString, inline: true});
                invasionsEmbed.fields.push({name: "ETA", value: x.eta, inline: true});
            }
        }
        return invasionsEmbed;
    }
    
    async function postResult() {
        try {
            message.channel.startTyping();
            const dropTableLastUpdated = await warframe.data.getBuildInfo();
            const worldStateData = await warframe.data.getWorldState();
            const ws = new WorldState(JSON.stringify(worldStateData));
            const makeInvasionsEmbed = await createEmbed(ws.invasions, dropTableLastUpdated);
            await message.channel.send({ embed: makeInvasionsEmbed });
            message.channel.stopTyping();
        } catch(err) {
            message.channel.send(err);
            message.channel.stopTyping();
        }
    }
    postResult();
}