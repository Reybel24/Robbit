/*
Plex & radarr helper
*/

const { radarr } = require('../config.json');
const axios = require('axios');

module.exports = {
    async searchMovie(movieName) {
        // Movie to add
        let radarrResp;
        await axios({
            method: 'get',
            url: `${radarr.baseUrl}api/v3/movie/lookup?apiKey=${radarr.apiKey}&term=${movieName}`,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(resp => {
            // console.log(resp.response);
            radarrResp = resp.data.slice(0, 3);
        }).catch(err => {
            //console.log(err.response);
            radarrResp = err;
        })

        return radarrResp;
    },

    async addMovie(movieId) {
        // Movie to add
        let data = {
            "title": "",
            "qualityProfileId": radarr.qualityProfiles.hd,
            "tmdbid": movieId,
            "monitored": true,
            "rootFolderPath": `${radarr.rootMediaPath}Movies\\`,
            "addOptions": {
                "searchForMovie": true
            }
        }

        let radarrResp;
        await axios({
            method: 'post',
            url: `${radarr.baseUrl}api/v3/movie?apiKey=${radarr.apiKey}`,
            headers: {
                'Content-Type': 'application/json'
            },
            data: data
        }).then(resp => {
            // console.log(resp.response);
            radarrResp = resp;
        }).catch(err => {
            // console.log(err.response);
            radarrResp = err.response;
        })

        // console.log(radarrResp)
        return radarrResp;
    }
}