/*
Hyperbeam api helpers
*/
const { hyperbeam } = require('../config.json');
const axios = require('axios');

module.exports = {
    // Create a room that will automatically open to a plex media item (movie)
    async createRoom(url) {
        let hyperbeamResp;
        await axios({
            method: 'post',
            url: `${hyperbeam.baseUrl}/vm`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${hyperbeam.apiKey}`
            },
            data: { 'start_url': url, 'offline_timeout': 15, 'profile_save': true }
        }).then(resp => {
            // console.log(resp.response);
            hyperbeamResp = resp.response;
        }).catch(err => {
            //console.log(err.response);
            hyperbeamResp = err.response;
        })

        // console.log(hyperbeamResp)
        return hyperbeamResp;
    }
}