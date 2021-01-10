exports.run = (bot, message) => {
    async function createEmbed() {
        const memberCount = bot.guilds.cache.map((guild) => guild.members.cache.filter(member => !member.user.bot).size).reduce((p, c) => p + c);
        const serverCount  = bot.guilds.cache.size;
        const statsEmbed = {
            color: 0x0099ff,
            title: `Wondyframe statistics`,
            description: `WondyFrame is currently used in ${serverCount} servers with a total of ${memberCount} users.`,
            footer: {
                text: 'This command is only usable by the bot owner.'
            }
        };
        return statsEmbed;
    }
    
    async function postResult() {
        try {
            message.channel.startTyping();
            const statsEmbed = await createEmbed();
            message.channel.send({ embed: statsEmbed }).catch(() => message.channel.stopTyping());
            bot.guilds.cache.forEach(guild => {
                console.log(`${guild.name} | ${guild.id} | ${guild.members.cache.filter(member => !member.user.bot).size}`);
            })
            message.channel.stopTyping();
        } catch(err) {
            message.channel.send(err).catch(() => message.channel.stopTyping());
            message.channel.stopTyping();
        }
    }
    if (message.author.id == '266598683246723072')
        postResult();
}