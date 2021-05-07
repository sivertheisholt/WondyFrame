exports.run = async (args1, args2, args3, warframeDropLocations, itemKeyWords) => {
    const warframe = require('../Handling/warframeHandler');
    const WorldState = require('warframe-worldstate-parser');

    async function createEmbed(worldState, worldStateTimestamp) {
        if(worldState == undefined)  {
            throw "Sorry there are currently no nightwave";
        }
        const nightwaveEmbed = {
            color: 0x0099ff,
            title: `Nightwave`,
            thumbnail: {
                url: "https://raw.githubusercontent.com/wfcd/warframe-items/development/data/img/nightwave-sigil.png",
            },
            fields: [],
            timestamp: worldStateTimestamp,
                footer: {
                    text: 'World state updated:  '
                },
        };
        for(challenge of worldState.activeChallenges) {
            nightwaveEmbed.fields.push({name: challenge.title, value: `Desc: ${challenge.desc} \n Type: ${challenge.isDaily ? "Daily" : "Weekly"}`, inline: true,})
        }

        
        return nightwaveEmbed;
    }
    
    async function postResult() {
        try {
            const worldStateData = await warframe.data.getWorldState();
            const ws = new WorldState(JSON.stringify(worldStateData));
            const makeNightwaveEmbed = await createEmbed(ws.nightwave, ws.timestamp);
            return makeNightwaveEmbed;
        } catch(err) {
            return err;
        }
    }
    return await postResult();
}