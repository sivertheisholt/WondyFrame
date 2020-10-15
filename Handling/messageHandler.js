var methods = {
    messageChecker: async function (bot, message, discordUser, prefix, warframeInfo, warframeRelicInfo, itemKeyWords) {
        message.content = message.content.toLowerCase();

        //Check if user is bot or is command
        if (discordUser.bot) { return }
        if (!message.content.startsWith(prefix)) { return }

        //Declaring some variables
        let command, args, args1, args2, args3;

        //Creates the message info
        let msg = message.content.toLowerCase().slice(prefix.length);
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

        //Try to start command
        try {
            let commandFile = require(`../Commands/${command}.js`);
            await commandFile.run(bot, message, args, args1, args2, warframeInfo, warframeRelicInfo, itemKeyWords);
        } catch (err) {
            message.channel.send("Invalid command! Please check wf.help")
        }
    }
};

exports.data = methods;