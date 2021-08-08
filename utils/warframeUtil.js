"use strict";

const logger = require('../logging/logger');
const warframe = require('../Handling/warframeHandler.js');
const sortWarframeData = require('../Handling/sortWarframeData.js');

exports.refreshData = async function(warframeDropInfo, warframeRelicInfo, itemKeyWords) {
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