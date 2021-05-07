exports.run = async (args1, args2, args3, warframeDropLocations, itemKeyWords) => {
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
            const worldStateData = await warframe.data.getWorldState();
            const ws = new WorldState(JSON.stringify(worldStateData));
            const makeFortunaEmbed = await createEmbed(ws.vallisCycle, ws.timestamp);
            return makeFortunaEmbed;
        } catch(err) {
            return err;
        }
    }
    return await postResult();
}