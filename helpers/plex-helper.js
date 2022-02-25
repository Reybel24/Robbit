/*
Plex & radarr helper
*/

const { plex, radarr } = require('../config.json');
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

        // console.log(radarrResp);

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
    },

    getPlexMediaUrl(ratingKey) {
        const url = `/details?key=%2Flibrary%2Fmetadata%2F${ratingKey}`;
        return url;
    },

    getPlexServerUrl() {
        return plex.baseServerUrl;
    },

    getPlexMediaShareableUrl(ratingKey) {
        const prefix = plex.baseServerUrl;
        const affix = this.getPlexMediaUrl(ratingKey);
        const fullUrl = prefix + affix;
        return fullUrl;
    }
}