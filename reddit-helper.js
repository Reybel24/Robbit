const axios = require('axios');
const Reddit = require("simple-reddit-api");

module.exports = {
    async getRandomPost() {
        const options = {
            subreddit: "AmItheAsshole",
            count: 1,
            fulldata: true
        };

        console.log("fetching random post");

        var post;
        await Reddit.randomPost(options).then(res => {
            // console.log(res.posts);
            post = res.posts[0].data;
        }).catch(err => {
            console.log("something went wrong fetching reddit post")
        })

        return post;
    }
}