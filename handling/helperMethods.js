"use strict";

var methods = {
	/**
	 * Make the first letter capital in all words from a string
	 * @param {*} stringIn String to capitalize
	 * @returns {String} String with first letter capitalized in all words
	 */
	makeCapitalFirstLettersFromString: function (stringIn) {
		let array = stringIn.split(" ");
		let stringOut = [];
		for (const x of array) {
			if (x == Number) {
				stringOut.push(x);
			} else {
				if (x.search("-") !== -1) {
					let getDashArray = x.split("-");
					let finalizedDashArray = [];
					for (const dashes of getDashArray) {
						finalizedDashArray.push(
							dashes.charAt(0).toUpperCase() + dashes.slice(1)
						);
					}
					stringOut.push(finalizedDashArray.join("-"));
				} else {
					stringOut.push(x.charAt(0).toUpperCase() + x.slice(1));
				}
			}
		}
		return stringOut.join(" ").trim();
	},
	/**
	 * Calculates the expected runs from a chance
	 * @param {Number} chanceIn The chance to use
	 * @returns {Number} The amount of runs needed to reach 90% probability
	 */
	getExpectedRuns: function (chanceIn) {
		let expectedRuns = 1;
		let mathPart2;
		do {
			let dropChanceFixed = 1 - chanceIn / 100;
			let mathPart1 = Math.pow(dropChanceFixed, expectedRuns);
			mathPart2 = 1 - mathPart1;
			expectedRuns++;
		} while (mathPart2 < 0.9);
		return expectedRuns;
	},
	/**
	 * Puts correct commas in number for easier readability
	 * @param {Number} number The number to prettify
	 * @returns {String} Pretty number
	 */
	makeNumberWithCommas: function (number) {
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	},
	/**
	 * Searches for an item in the global item map
	 * @param {String} name
	 * @param {Map} dropLocations
	 * @returns {Object|undefined} Item or undefined if nothing is found
	 */
	searchForItemInMap: function (name, dropLocations) {
		for (const item of dropLocations.keys()) {
			if (item == name) {
				return item;
			}
		}
		for (const item of dropLocations.keys()) {
			if (item.search(name) !== -1) {
				return item;
			}
		}
		return undefined;
	},
	/**
	 * Turns milliseconds to a human readable time
	 * @param {Number} s Milliseconds
	 * @returns {String} HH MM SS format
	 */
	msToTime: function (s) {
		var ms = s % 1000;
		s = (s - ms) / 1000;
		var secs = s % 60;
		s = (s - secs) / 60;
		var mins = s % 60;
		var hrs = (s - mins) / 60;

		if (hrs == 0) {
			return `${mins}m ${secs}s`;
		} else {
			return `${hrs}h ${mins}m ${secs}s`;
		}
	},
	/**
	 * Find the difference between 2 times in minutes
	 * @param {Date} dt2 The latest time
	 * @param {Date} dt1 The earliest time
	 * @returns {Number} The difference in minutes
	 */
	diff_minutes: function (dt2, dt1) {
		var diff = (dt2.getTime() - dt1.getTime()) / 1000;
		diff /= 60;
		return Math.abs(Math.round(diff));
	},
	/**
	 * Turns a date into a more readable string
	 * @param {String} stringIn String of date to convert
	 * @returns {String} HH MM SS
	 */
	toHHMMSS: function (stringIn) {
		var sec_num = parseInt(stringIn, 10); // don't forget the second param
		var hours = Math.floor(sec_num / 3600);
		var minutes = Math.floor((sec_num - hours * 3600) / 60);
		var seconds = sec_num - hours * 3600 - minutes * 60;

		if (hours < 10) {
			hours = "0" + hours;
		}
		if (minutes < 10) {
			minutes = "0" + minutes;
		}
		if (seconds < 10) {
			seconds = "0" + seconds;
		}
		if (hours == 0) {
			return `${minutes}m ${seconds}s`;
		} else {
			return `${hours}h ${minutes}m ${seconds}s`;
		}
	},
	/**
	 * Removes the fields after a specific index
	 * @param {Object} embed Discord embed
	 * @param {Number} numberOfFields The last index to keep
	 */
	removeDropFields: function (embed, numberOfFields) {
		embed.fields = embed.fields.slice(0, numberOfFields);
	},
	/**
	 * Responds to interaction with DEFERRED_UPDATE_MESSAGE* type
	 * @param {Object} bot The bot client
	 * @param {String} interactionId Interaction id of the new interaction
	 * @param {String} interactionToken Interaction token of the new interaction
	 */
	successRespond: function (bot, interactionId, interactionToken) {
		bot.api.interactions(interactionId, interactionToken).callback.post({
			data: {
				type: 6,
			},
		});
	},
	/**
	 * Check if drops exist and sorts by chance
	 * @param {Array} dropLocations
	 * @returns {String|Array} Sorted array list or "Vaulted"
	 */
	sortByChance: function (dropLocations) {
		//Check if drop locations exist
		if (dropLocations == undefined) {
			return "Vaulted";
		}

		//Sort data
		dropLocations.sort((a, b) => {
			return b.chance - a.chance;
		});

		//Return sorted drops
		return dropLocations;
	},
	cleanDroplocations: function (droplocations) {
		let array = [];
		for (const location of droplocations) {
			if (!location.isEvent) {
				array.push(location);
			}
		}
		return array;
	},
};

exports.data = methods;
