 "use strict";

 const messageHandler = require('../Handling/messageHandler.js');
 const logger = require('../logging/logger');

 async function interaction_new(bot, interaction, messageString, prefix, warframeDropInfo, warframeRelicInfo, itemKeyWords) {
    const result = await messageHandler.slashMessage(bot, interaction.channel_id, messageString, prefix, warframeDropInfo, warframeRelicInfo, itemKeyWords)
    console.log(result);
    bot.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data: result
        }
    })
}

exports.interaction_route = function(bot, interaction, messageString, prefix, warframeDropInfo, warframeRelicInfo, itemKeyWords) {
    if(interaction.data.custom_id != undefined) {
        let commandFile = require(`../interactions/${interaction.data.custom_id}.js`);
        commandFile.run(bot, interaction);
    } else {
        interaction_new(bot, interaction, messageString, prefix, warframeDropInfo, warframeRelicInfo, itemKeyWords);
    }
}