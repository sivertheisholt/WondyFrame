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
    }
}

exports.data = methods;