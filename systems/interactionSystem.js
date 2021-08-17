 "use strict";

 const messageHandler = require('../Handling/messageHandler.js');
 const logger = require('../logging/logger');

 async function interaction_new(bot, interaction, warframeDropInfo, warframeRelicInfo, itemKeyWords) {
    logger.debug('Creating new interaction to send')
    
    const result = await messageHandler.slashMessage(bot, interaction, warframeDropInfo, warframeRelicInfo, itemKeyWords)

    bot.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data: result
        }
    })
    logger.debug('Successfully sent new interaction');
}

exports.interaction_route = function(bot, interaction, warframeDropInfo, warframeRelicInfo, itemKeyWords) {
    logger.debug('Routing interaction')
    if(interaction.data.custom_id != undefined) {
        logger.debug('Interaction on existing message detected')
        let commandFile = require(`../interactions/${interaction.message.interaction.name}.js`);
        commandFile.run(interaction);
    } else {
        interaction_new(bot, interaction, warframeDropInfo, warframeRelicInfo, itemKeyWords);
    }
}