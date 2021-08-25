'use strict';

const axios = require('axios').default;

const baseUrl = "https://discord.com/api/v8";

exports.get_original_interaction = async (applicationId, interactionToken) => {
    const url = `${baseUrl}/webhooks/${applicationId}/${interactionToken}/messages/@original`
    return sendRequest("GET", url, {});
}

exports.edit_original_interaction = (applicationId, interactionToken, data) => {
    const url = `${baseUrl}/webhooks/${applicationId}/${interactionToken}/messages/@original`
    return sendRequest("PATCH", url, data);
}

exports.delete_original_interaction = (applicationId, interactionToken) => {
    const url = `${baseUrl}/webhooks/${applicationId}/${interactionToken}/messages/@original`
    return sendRequest("DELETE", url, {});
}

async function sendRequest(method, url, data) {
    return axios({
        method: method,
        url: url,
        data: data,
        headers: { 
            Authorization: `Bot ${process.env.DISCORD_TOKEN}`
        }
    });
}
