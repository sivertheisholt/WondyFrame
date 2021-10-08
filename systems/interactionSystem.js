 "use strict";

 const messageHandler = require('../handling/messageHandler.js');
 const logger = require('../logging/logger');
 let interactionMap = new Map();

 async function interaction_new(bot, interaction, warframeDropInfo, warframeRelicInfo, itemKeyWords) {
    logger.debug('Creating new interaction to send')
    
    const result = await messageHandler.slashMessage(bot, interaction, warframeDropInfo, warframeRelicInfo, itemKeyWords)

    bot.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
            type: 4,
            data: result
        }
    })

    //Adding interaction to map
    interactionMap.set(interaction.id, {token: interaction.token, timeSent: new Date().getTime()})
    logger.debug('Successfully sent new interaction');
}

exports.interaction_route = function(bot, interaction, warframeDropInfo, warframeRelicInfo, itemKeyWords) {
    logger.debug('Routing interaction')

    if(interaction.data.custom_id != undefined) {
        logger.debug('Interaction on existing message detected')

        //If prod mode, run like normal
        if(process.env.NODE_ENV.toUpperCase() == "PRODUCTION") {
            if(interactionMap.get(interaction.message.interaction.id) != undefined || (interactionMap.get(interaction.message.interaction.id).time - new Date().getTime()) <= 870000) {
                logger.debug('Interaction is less than 14.5m old')
                let commandFile = require(`../interactions/${interaction.message.interaction.name}Interaction.js`);
                commandFile.run(interaction);
            } else {
    
            }
        //If debug mode, skip 15m check
        } else {
            logger.debug('Interaction is less than 14.5m old - debug mode');
            let commandFile = require(`../interactions/${interaction.message.interaction.name}Interaction.js`);
            commandFile.run(bot, interaction, interactionMap.get(interaction.message.interaction.id));
        }
    } else {
        interaction_new(bot, interaction, warframeDropInfo, warframeRelicInfo, itemKeyWords);
    }
}

async function interaction_resend() {

}

exports.interaction_clean = function() {

}

exports.interaction_get_original = function() {

}