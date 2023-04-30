'use strict'

const Discord = require("discord.js");

/**
 * Gets cetus information
 * @returns {Object} Discord interaction data
 */
exports.run = () => {
    let policyEmbed = new Discord.MessageEmbed()
                        .setColor(0x0099ff)
                        .setTitle('Privacy Policy')
                        .addField('By having WondyFrame in your server, you agree to the following privacy policy:', '\u200B', false)
                        .addField('What information is stored?', "Only guild ID is stored in the database.", false)
                        .addField('Questions and concerns', 'If you are concerned about the data stored, DM Wondyr#5763 on Discord.')
                        .addField('Note', 'We reserve the right to change this without notifying our users.')
                        .setFooter('This policy was last updated October 9th, 2021.')
    return {content: undefined, embeds: [policyEmbed]}
}