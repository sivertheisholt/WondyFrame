exports.run = async (args1, args2, args3, warframeDropLocations, itemKeyWords) => {
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
            const worldStateData = await warframe.data.getWorldState();
            const ws = new WorldState(JSON.stringify(worldStateData));
            const makeCambionEmbed = await createEmbed(ws.cambionCycle, ws.timestamp);
            return makeCambionEmbed;
        } catch(err) {
            return err;
        }
    }
    return await postResult();
}