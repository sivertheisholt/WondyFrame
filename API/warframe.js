const fetch = require('node-fetch');

var Warframe = function ClaWarframesh(token) {
    if (!(this instanceof Warframe))
        return new Warframe();
};

Warframe.prototype.getData = function getDataClansNotoken(command, addParams) {
    return new Promise((resolve, reject) => {
        var url = `https://drops.warframestat.us${command}`;
        fetch(url).then(async res=>{
            if(res.ok) {
                resolve(res.json());
            } else {
                reject("Sorry this item does not exist");
            }
        })
    })
    
}

module.exports = Warframe;
