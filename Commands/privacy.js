exports.run = (bot, message, args1, args2, args3, warframeDropLocations, itemKeyWords) => {

    function createEmbed() {
        const policyEmbed = {
            color: 0x0099ff,
            title: `Privacy Policy`,
            fields: [{
                name: "By having WondyFrame in your server, you agree to the following privacy policy.",
                value: "\u200B",
                inline: false,
            },{
                name: "What information is stored?",
                value: "Currently, no information is stored.",
                inline: false,
            },
            {
                name: "Questions and concerns",
                value: "If you are concerned about the data stored, DM WonderCrack#5763 on Discord.",
                inline: false,
            },
            {
                name: "Note",
                value: "We reserve the right to change this without notifying our users.",
                inline: false,
            }],
            footer: {
                text: 'This policy was last updated October 29th, 2020.'
            },
        };
        return policyEmbed;
    }
    
    async function postResult() {
        try {
            message.channel.startTyping();
            const policyEmbed = await createEmbed();
            await message.channel.send({ embed: policyEmbed }).catch(() => message.channel.stopTyping());
            message.channel.stopTyping();
        } catch(err) {
            message.channel.send(err).catch(() => message.channel.stopTyping());;
            message.channel.stopTyping();
        }
    }
    postResult();
}