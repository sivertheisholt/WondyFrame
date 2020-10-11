var methods = {
    makeCapitalFirstLettersFromString: function (stringIn) {
        let array = stringIn.split(" ");
        let stringOut = [];
        for(const x of array) {
            if(x == Number) {
                stringOut.push(x)
            } else {
                if(x.search("-") !== -1) {

                    let getDashArray = x.split("-");
                    let finalizedDashArray = [];
                    for(dashes of getDashArray) {
                        finalizedDashArray.push(dashes.charAt(0).toUpperCase() + dashes.slice(1));
                    }
                    stringOut.push(finalizedDashArray.join("-"));
                } else {
                    stringOut.push(x.charAt(0).toUpperCase() + x.slice(1))
                }
            }
        }
        return stringOut.join(" ").trim();
    },
    getExpectedRuns: function(chanceIn) {
        let expectedRuns = 1;
            do {
                dropChanceFixed = 1 - (chanceIn/100);
                mathPart1 = Math.pow(dropChanceFixed, expectedRuns);
                mathPart2 = 1 - mathPart1;
                expectedRuns++;
            } while(mathPart2 < 0.9)
        return expectedRuns;
    },
    makeNumberWithCommas: function(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    searchForItemInMap: function(name, dropLocations) {
        for(const item of dropLocations.keys()) {
            if(item == name) {
                return item;
            }
        }
        for(const item of dropLocations.keys()) {
            if(item.search(name) !== -1) {
                return item;
            }
        }
        return undefined;
    },
    msToTime: function(s) {
        var ms = s % 1000;
        s = (s - ms) / 1000;
        var secs = s % 60;
        s = (s - secs) / 60;
        var mins = s % 60;
        var hrs = (s - mins) / 60;

        if(hrs == 0) {
            return `${mins}m ${secs}s` 
        } else {
            return `${hrs}h ${mins}m ${secs}s` 
        }
    },
    diff_minutes: function(dt2, dt1) {
        var diff =(dt2.getTime() - dt1.getTime()) / 1000;
        diff /= 60;
        return Math.abs(Math.round(diff));
    },
    toHHMMSS: function (stringIn) {
        var sec_num = parseInt(stringIn, 10); // don't forget the second param
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);
    
        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        if(hours == 0) {
            return `${minutes}m ${seconds}s` 
        } else {
            return `${hours}h ${minutes}m ${seconds}s` 
        }
    }
}

exports.data = methods;