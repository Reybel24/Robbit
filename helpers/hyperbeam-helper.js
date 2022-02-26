/*
Hyperbeam api helpers
*/
const { hyperbeam } = require('../config.json');
const axios = require('axios');
const profileName = 'discord_party_robbit';

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
            data: { 'start_url': url, 'offline_timeout': 15, 'profile_save': true, 'kiosk': true }
        }).then(resp => {
            console.log(resp.data);
            hyperbeamResp = resp;
        }).catch(err => {
            //console.log(err.response);
            hyperbeamResp = err.response;
        })

        // console.log(hyperbeamResp)
        return hyperbeamResp;
    },
    async getActiveRooms() {
        let hyperbeamResp;
        await axios({
            method: 'get',
            url: `${hyperbeam.baseUrl}/vm`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${hyperbeam.apiKey}`
            }
        }).then(resp => {
            // console.log(resp);
            hyperbeamResp = resp.data;
        }).catch(err => {
            //console.log(err.response);
            hyperbeamResp = err.response;
        })

        // console.log(hyperbeamResp)
        return hyperbeamResp;
    },
    async deleteAllActiveRooms() {
        let rooms = await this.getActiveRooms();
        for (let i = 0; i < rooms.results.length; i++) {
            await this.deleteRoom(rooms.results[i].id);
        }
    },
    async deleteRoom(roomId) {
        let hyperbeamResp;
        await axios({
            method: 'delete',
            url: `${hyperbeam.baseUrl}/vm/${roomId}`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${hyperbeam.apiKey}`
            },
        }).then(resp => {
            // console.log(resp.response);
            hyperbeamResp = resp;
        }).catch(err => {
            //console.log(err.response);
            hyperbeamResp = err.response;
        })

        // console.log(hyperbeamResp)
        return hyperbeamResp;
    },
}