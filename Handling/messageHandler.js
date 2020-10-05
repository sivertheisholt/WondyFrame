var methods = {
    messageChecker: async function (bot, message, discordUser, prefix, warframeInfo) {

        //Check if user is bot or is command
        if (discordUser.bot) { return }
        if (!message.content.startsWith(prefix)) { return }

        //Declaring some variables
        let command, args, args1, args2;

        //Creates the message info
        let msg = message.content.toLowerCase().slice(prefix.length);
        if (msg.startsWith("request")) {
            command = msg.slice(0, 7);
            args = msg.slice(8);
            console.log(args);
        } else {
            [command, args, args1, args2] = msg.split(" ");
        }

        //Try to start command
        try {
            let commandFile = require(`../Commands/${command}.js`);
            await commandFile.run(bot, message, args, args1, args2, warframeInfo);
            console.log(message.author.username + " ran the command: " + command);
        } catch (err) {
            message.channel.send("Invalid command! Please check !help")
        }
    }
};

exports.data = methods;