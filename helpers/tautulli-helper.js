/*
Plex & radarr helper
*/

const { tautulli } = require('../config.json');
const axios = require('axios');

module.exports = {
    async searchMovie(movieName, imdbId) {
        // Movie to add
        let tautulliResp;
        await axios({
            method: 'get',
            url: `${tautulli.baseUrl}?apikey=${tautulli.apiKey}&cmd=search&query=${movieName}&limit=3`,
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(resp => {
            // console.log(resp.response);
            // tautulliResp = resp.data.slice(0, 3);
            tautulliResp = resp.data.response.data;
        }).catch(err => {
            //console.log(err.response);
            tautulliResp = err;
        })

        // console.log(tautulliResp.results_list.movie.length);
        // console.log(tautulliResp.results_list.movie);

        let results = tautulliResp.results_list.movie;

        // console.log("searching for imdb id: ", imdbId)

        let tautulliMediaItem = null;
        results.filter((mediaItem) => {
            let parsedId = this.parseImdbIdFromGuid(mediaItem.guid);
            // console.log("parsed imdb id: ", imdbId)
            return parsedId == imdbId;
        })
        if (results.length > 0) {
            tautulliMediaItem = results[0];
        }

        return tautulliMediaItem;
    },

    parseImdbIdFromGuid(guid) {
        let id = guid.substring(guid.lastIndexOf('/') + 1);
        id = id.split('?')[0];
        return id;
    }
}