const Discord = require('discord.js');
exports.chatMessage = async function(messageObject, discordUser, prefix, warframeInfo, warframeRelicInfo, itemKeyWords) {
    //Check if user is bot or is command
    if (discordUser.bot) return;
    if (!messageObject.content.startsWith(prefix)) return;

    //Formats message
    const formatMessage = await messageFormatter(messageObject.content, prefix);

    //Try to start command
    try {
        let commandFile = require(`../Commands/${formatMessage[0]}.js`);
        messageObject.channel.startTyping();
        sendResultNormal(formatMessage[0], messageObject, await commandFile.run(formatMessage[1], formatMessage[2], formatMessage[3], warframeInfo, warframeRelicInfo, itemKeyWords));
    } catch (err) {
        messageObject.channel.stopTyping();
    }
}

exports.slashMessage = async function(bot, channelId, messageString, prefix, warframeInfo, warframeRelicInfo, itemKeyWords) {
    const formatMessage = await messageFormatter(messageString, prefix);
    try {
        let commandFile = require(`../Commands/${formatMessage[0]}.js`);
        const result = await commandFile.run(formatMessage[1], formatMessage[2], formatMessage[3], warframeInfo, warframeRelicInfo, itemKeyWords);
        if(typeof result == 'object') {
            if(formatMessage[0] == "baro") {
                const apiMessage = await Discord.APIMessage.create(bot.channels.resolve(channelId), new Discord.MessageEmbed(result[0]))
                .resolveData()
                .resolveFiles()
            apiMessage.data.embeds.push(new Discord.MessageEmbed(result[1]));
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

async function sendResultNormal(command, message, result) {
    try {
        if(typeof result === 'string') {
            throw result;
        }
        if(command === "help") {
            message.author.send({ embed: result }).catch(() => message.channel.stopTyping());
            message.channel.stopTyping();
            return;
        }
        if(Array.isArray(result)) {
            if(result.length > 1) {
                for(const embedInfo of result) {
                    message.channel.send({embed: embedInfo}).catch(() => message.channel.stopTyping());
                }
                message.channel.stopTyping();
                return;
            }
            message.channel.send({embed: result[0]}).catch(() => message.channel.stopTyping());
            message.channel.stopTyping();
            return;
        }
        message.channel.send({embed: result}).catch(() => message.channel.stopTyping());
        message.channel.stopTyping();
    } catch(err) {
        message.channel.send(err).catch(() => message.channel.stopTyping());
        message.channel.stopTyping();
    }
}