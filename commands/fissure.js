exports.run = async (args1, args2, args3, warframeDropLocations, itemKeyWords) => {
    const warframe = require('../Handling/warframeHandler');
    const WorldState = require('warframe-worldstate-parser');

    async function createEmbed(worldState, worldStateTimestamp) {
        const fissureEmbed = {
            color: 0x0099ff,
            title: `Current fissure missions`,
            thumbnail: {
                url: "https://raw.githubusercontent.com/wfcd/warframe-items/development/data/img/void-traces.png",
            },
            fields: [],
            timestamp: worldStateTimestamp,
                footer: {
                    text: 'World state updated:  '
                },
        };
        for(fissure of worldState) {
            fissureEmbed.fields.push({name: fissure.node, value: `Tier: ${fissure.tier} \n Type: ${fissure.missionType} \n Time left: ${fissure.eta}`, inline: true,})
        }
        return fissureEmbed;
    }
    
    async function postResult() {
        try {
            const worldStateData = await warframe.data.getWorldState();
            const ws = new WorldState(JSON.stringify(worldStateData));
            const makeFissureEmbed = await createEmbed(ws.fissures, ws.timestamp);
            return makeFissureEmbed;
        } catch(err) {
           return err;
        }
    }
    return await postResult();
}