"use strict";

const logger = require('../logging/logger');
const warframe = require('../handling/warframeHandler.js.js');
const sortWarframeData = require('../handling/sortWarframeData.js.js');
let warframeDropInfo, warframeRelicInfo, itemKeyWords;

exports.refreshData = async function() {
    try {
        logger.info("Getting mission rewards and relic rewards...");
        let getWarframeData = await warframe.data.getMissionRewards();
        let getWarframeRelicData = await warframe.data.getAllRelicInfo();
        let getWarframeCetusBountyRewards = await warframe.data.getCetusBountyRewards();
        let getWarframeFortunaBountyRewards = await warframe.data.getFortunaBountyRewards();
        let getWarframeDeimosBountyRewards = await warframe.data.getDeimosBountyRewards();
        let getEnemyBlueprintDrops = await warframe.data.getEnemyBlueprintDrops();
        let getTransientRewards = await warframe.data.getTransientRewards();
        let getEnemyModDrops = await warframe.data.getEnemyModDrops();
        let getMiscItemDrops = await warframe.data.getMiscDrops();
        let getSortieRewards = await warframe.data.getSortieRewards();
        warframeDropInfo = await sortWarframeData.data.sortData(getWarframeData, getWarframeCetusBountyRewards, getWarframeFortunaBountyRewards, getWarframeDeimosBountyRewards, getEnemyBlueprintDrops, getTransientRewards, getEnemyModDrops, getMiscItemDrops, getSortieRewards);
        warframeRelicInfo = await sortWarframeData.data.sortDataRelicDrops(getWarframeRelicData);
        itemKeyWords = warframeDropInfo.keys();
        logger.info("Done getting mission rewards and relic rewards!");
        return true;
    } catch(err) {
        logger.error(err);
        return false;
    }
}

exports.get_warframe_drop = function() {
    return warframeDropInfo;
}
exports.get_warframe_relic = function() {
    return warframeRelicInfo;
}
exports.get_warframe_itemKey = function() {
    return itemKeyWords;
}