exports.run = async (args1, args2, args3, warframeDropLocations, itemKeyWords) => {
    const warframe = require('../Handling/warframeHandler');
    const WorldState = require('warframe-worldstate-parser');

    async function createEmbed(worldState, worldStateTimestamp) {
        const sortieEmbed = {
            color: 0x0099ff,
            title: `Current sortie missions`,
            thumbnail: {
                url: "https://vignette.wikia.nocookie.net/warframe/images/1/15/Sortie_b.png",
            },
            fields: [{
                name: "Mission 1",
                value: `Node: ${worldState.variants[0].node} \n Type: ${worldState.variants[0].missionType} \n Modifier: ${worldState.variants[0].modifier} \n Modifier Description: ${worldState.variants[0].modifierDescription}`,
                inline: false,
            },
            {
                name: "Mission 2",
                value: `Node: ${worldState.variants[1].node} \n Type: ${worldState.variants[1].missionType} \n Modifier: ${worldState.variants[1].modifier} \n Modifier Description: ${worldState.variants[1].modifierDescription}`,
                inline: false,
            },
            {
                name: "Mission 3",
                value: `Node: ${worldState.variants[2].node} \n Type: ${worldState.variants[2].missionType} \n Modifier: ${worldState.variants[2].modifier} \n Modifier Description: ${worldState.variants[2].modifierDescription}`,
                inline: false,
            },
            {
                name: "Time left",
                value: worldState.eta,
                inline: false,
            }],
            timestamp: worldStateTimestamp,
                footer: {
                    text: 'World state updated:  '
                },
        };
        return sortieEmbed;
    }
    
    async function postResult() {
        try {
            const worldStateData = await warframe.data.getWorldState();
            const ws = new WorldState(JSON.stringify(worldStateData));
            const makeSortieEmbed = await createEmbed(ws.sortie, ws.timestamp);
            return makeSortieEmbed;
        } catch(err) {
            return err;
        }
    }
    return await postResult();
}