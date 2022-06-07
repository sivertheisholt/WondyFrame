"use strict";

const logger = require("../logging/logger");
const warframe = require("../handling/warframeHandler.js");
const sortWarframeData = require("../handling/sortWarframeData.js");
const dojoItems = require("../storage/customItems/shopitems.json");
let warframeDropInfo, warframeRelicInfo, itemKeyWords;

//TODO - Rewrite
exports.refreshData = async function () {
	try {
		logger.info("Getting mission rewards and relic rewards...");

		var promises = [
			warframe.data.getMissionRewards(),
			warframe.data.getAllRelicInfo(),
			warframe.data.getCetusBountyRewards(),
			warframe.data.getFortunaBountyRewards(),
			warframe.data.getDeimosBountyRewards(),
			warframe.data.getEnemyBlueprintDrops(),
			warframe.data.getTransientRewards(),
			warframe.data.getEnemyModDrops(),
			warframe.data.getMiscDrops(),
			warframe.data.getSortieRewards(),
		];

		const apiData = await Promise.all(promises);
		

		let data = {
			missionRewards: apiData[0].missionRewards,
			cetusData: apiData[2].cetusBountyRewards,
			fortunaData: apiData[3].solarisBountyRewards,
			deimosData: apiData[4].deimosRewards,
			enemyBlueprintData: apiData[5].enemyBlueprintTables,
			transientData: apiData[6].transientRewards,
			enemyModData: apiData[7].enemyModTables,
			miscData: apiData[8].miscItems,
			sortieData: apiData[9].sortieRewards,
			dojoItems: dojoItems.Shop,
		};

		warframeDropInfo = await sortWarframeData.data.sortData(data);
		warframeRelicInfo = await sortWarframeData.data.sortDataRelicDrops(
			apiData[1].relics
		);
		itemKeyWords = warframeDropInfo.keys();
		logger.info("Done getting mission rewards and relic rewards!");
		return true;
	} catch (err) {
		logger.error(err);
		return false;
	}
};

exports.get_warframe_drop = function () {
	return warframeDropInfo;
};
exports.get_warframe_relic = function () {
	return warframeRelicInfo;
};
exports.get_warframe_itemKey = function () {
	return itemKeyWords;
};
