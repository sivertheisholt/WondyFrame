const Discord = require('discord.js');

exports.slashMessage = async function(bot, channelId, messageString, prefix, warframeInfo, warframeRelicInfo, itemKeyWords) {
    const formatMessage = await messageFormatter(messageString, prefix);
    console.log(formatMessage);
    try {
        let commandFile = require(`../Commands/${formatMessage[0]}.js`);
        const result = await commandFile.run(formatMessage[1], formatMessage[2], formatMessage[3], warframeInfo, warframeRelicInfo, itemKeyWords);
        if(typeof result == 'object') {
            if(formatMessage[0] == "baro") {
                const apiMessage = await Discord.APIMessage.create(bot.channels.resolve(channelId), new Discord.MessageEmbed(result[0]))
                .resolveData()
                .resolveFiles()
            if(result[0].fields.length > 10) {
                apiMessage.data.embeds.push(new Discord.MessageEmbed(result[1]));
            }
            return {...apiMessage.data, files: apiMessage.files};
            }
            const apiMessage = await Discord.APIMessage.create(bot.channels.resolve(channelId), new Discord.MessageEmbed(result))
                .resolveData()
                .resolveFiles()
            return {...apiMessage.data, files: apiMessage.files};
        }
        return {content: result};
    } catch (err) {
        console.log(err);
        //message.channel.send("Invalid command! Please check wf.help")
    }
}

function messageFormatter(message, prefix) {
    let command, args, args1, args2, args3;
    //Creates the message info
    let msg = message.toLowerCase().slice(prefix.length);
    if (msg.startsWith("item")) {
        command = msg.slice(0, 4);
        if(msg.search("-yes") !== -1 || msg.search("-no") !== -1) {
            [args, args1] = msg.slice(5).split("-");
            args = args.trim();
        } else {
            args = msg.slice(5);
        }
    } else {
        [command, args, args1, args2, args3] = msg.split(" ");
    }
    return [command, args, args1, args2, args3];
}