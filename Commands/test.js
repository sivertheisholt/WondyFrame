exports.run = (bot, message, relicType, relicName, relicRefinement, warframeDropLocations, itemKeyWords) => {

    const test = "frost neuro";

    for(const x of warframeDropLocations.keys())  {
        if(x.search(test) !== -1) {
            console.log(x);
        }
    }

    //const found = array1.find("trinity prime ch");
    // expected output: 12
}