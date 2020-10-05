const fs = require('fs');
const commands = JSON.parse(fs.readFileSync('./Storage/commands.json'));
const Discord = require('discord.js');
const prefix = '!';
exports.run = (bot, message, args, func) => {

    //Makes a new embed(Nice looking message :D)
    const embed = new Discord.RichEmbed()
        .setColor(0xFF0000)

    let commandsFound = 0;

    for (var cmd in commands) {
        typeof image_array !== 'undefined' && image_array.length > 0
        if (typeof args === 'undefined' || args <= 0) {
            if (commands[cmd].group.toUpperCase() === 'USER') {
                commandsFound++

                embed.addField(`${commands[cmd].name}`, `**Description:** ${commands[cmd].desc}\n**Usage:** ${prefix + commands[cmd].usage}`, true);
            }
        } else if (commands[cmd].group.toLowerCase() === args[0]) {
            commandsFound++

            embed.addField(`${commands[cmd].name}`, `**Description:** ${commands[cmd].desc}\n**Usage:** ${prefix + commands[cmd].usage}`, true);
        }
    }

    embed.setFooter(`Showing user commands. For more information about another group do: ${prefix}help [group / command]`)
    embed.setDescription(`**${commandsFound} commands found** - <> is required, [] is not required.`)

    //sends the embed(The nice message :D)
    message.author.send({ embed })
    message.channel.send({
        embed: {
            color: 0xFF0000,
            description: `**Check PM ${message.author}!**`
        }
    })
}