exports.run = (bot, message, args, func) => {

    function createHelpEmbed() {
        const helpEmbed = {
            color: 0x0099ff,
            thumbnail: {
                url: "https://raw.githubusercontent.com/wfcd/warframe-items/development/data/img/tenno-help-glyph.png",
            },
            description: "** command <Required> / [Optional] - Accepted values for optional will be in () **",
            fields: [{
                name: "***WF.Relic <Relic Name> [Refinement (Radiant / Flawless / Exceptional / Intact)] ***",
                value: `Search for relic information`,
                inline: false,
            },
            {
                name: "***WF.Item <Item Name> [Vaulted (-Yes / -No)] ***",
                value: `WIP: Search for item`,
                inline: false,
            },
            {
                name: "***WF.Baro ***",
                value: `Show current information about Baro Ki'Teer`,
                inline: false,
            },
            {
                name: "***WF.Sortie ***",
                value: `Show current active sortie`,
                inline: false,
            },
            {
                name: "***WF.Invasion ***",
                value: `Show current active invasions`,
                inline: false,
            },
            {
                name: "***WF.Nightwave ***",
                value: `Show current active nightwave challenges`,
                inline: false,
            },
            {
                name: "***WF.Fissure ***",
                value: `Show current active fissure missions`,
                inline: false,
            },
            {
                name: "***WF.Earth ***",
                value: `Show day/night on Earth`,
                inline: false,
            },
            {
                name: "***WF.Cetus ***",
                value: `Show day/night on Cetus`,
                inline: false,
            },
            {
                name: "***WF.Fortuna ***",
                value: `Show cold/warm on Orb Vallis`,
                inline: false,
            },
            {
                name: "***WF.Deimos ***",
                value: `Show fass/vome on Cambion Drift`,
                inline: false,
            },
            {
                name: "***WF.Privacy ***",
                value: `Show Privacy Policy`,
                inline: false,
            }],
        };
        return helpEmbed;
    }
   
    async function postResult() {
        try {
            message.channel.startTyping();
            const makeHelpEmbed = await createHelpEmbed();
            await message.author.send({ embed: makeHelpEmbed }).catch(err => message.channel.stopTyping());
            message.channel.stopTyping();
        } catch(err) {
            message.channel.send(err).catch(err => message.channel.stopTyping());;
            message.channel.stopTyping();
        }
    }
    postResult();
}