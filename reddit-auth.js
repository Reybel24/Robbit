const axios = require('axios');
const Reddit = require("simple-reddit-api");
const { redditClientId, redditClientSecret } = require('./config.json');

// Request reddit auth token
const credentials = Buffer.from(`${redditClientId}:${redditClientSecret}`).toString("base64")

/*
axios.post('https://www.reddit.com/api/v1/access_token', {
    headers: {
        'Authorization': `Basic ${clientId}`,
        'User-Agent': 'MyBot/0.0.1'
    }
})
    .then((res) => {
        console.log(res.data)
    })
    .catch((error) => {
        console.error(error)
    })
    */


const options = {
    subreddit: "AmItheAsshole",
    count: 3,
    fulldata: true
};
Reddit.randomPost(options).then(res => {
    console.log(res.posts);
})