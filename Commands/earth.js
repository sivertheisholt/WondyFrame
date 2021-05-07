exports.run = async (args1, args2, args3, warframeDropLocations, itemKeyWords) => {
    const warframe = require('../Handling/warframeHandler');
    const WorldState = require('warframe-worldstate-parser');

    function createEmbed(worldState, worldStateTimestamp) {
        const earthEmbed = {
            color: 0x0099ff,
            title: `Earth`,
            thumbnail: {
                url: "https://raw.githubusercontent.com/wfcd/warframe-items/development/data/img/the-steel-path-earth.png",
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
        return earthEmbed;
    }
    
    async function postResult() {
        try {
            const worldStateData = await warframe.data.getWorldState();
            const ws = new WorldState(JSON.stringify(worldStateData));
            const makeEarthEmbed = await createEmbed(ws.earthCycle, ws.timestamp);
            return makeEarthEmbed;
        } catch(err) {
            return err;
        }
    }
    return await postResult();
}