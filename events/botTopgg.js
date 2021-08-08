"use strict";

const AutoPoster = require('topgg-autoposter')
const logger = require('../logging/logger');

exports.bot_topgg = function() {
    if(process.env.NODE_ENV.toUpperCase() === 'PRODUCTION') {
        const ap = AutoPoster(process.env.TOPGG_TOKEN, bot)
        ap.on('posted', () => {
            console.log('Posted stats to Top.gg!')
        })   
    }
}