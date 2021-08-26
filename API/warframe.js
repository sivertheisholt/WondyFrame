"use strict";

const fetch = require('node-fetch').default;

var Warframe = function Warframe(token) {
    if (!(this instanceof Warframe))
        return new Warframe();
};

Warframe.prototype.getData = function getData(command, itemName) {
    return new Promise((resolve, reject) => {
        var url = `https://drops.warframestat.us${command}`;
        fetch(url).then(res=>{
            if(res.ok) {
                resolve(res.json());
            } else {
                reject(`Sorry I can't find any drop locations for: ${itemName}`);
            }
        })
    })
},
Warframe.prototype.getWorldState = function getWorldState() {
    return new Promise((resolve, reject) => {
        var url = `http://content.warframe.com/dynamic/worldState.php`;
        fetch(url).then(res=>{
            if(res.ok) {
                resolve(res.json());
            } else {
                reject(`Sorry can't load worldstate right now`);
            }
        })
    })
}

module.exports = Warframe;
