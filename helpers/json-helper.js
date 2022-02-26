/*
JSON helper
*/
const fs = require("fs");
const data_aita = require('../data/aita.json');

const peopleEmojis = [
    '<:bearded_person_tone4:946950811924189315>',
    '<:man_tone4:946955570429165618>',
    '<:woman_with_headscarf_tone4:946956009484730438>',
    '<:woman_curly_haired_tone4:946955728743194714>',
]

const voteEmojis = {
    'ah': '<:peach:946951424980447282>',
    'nta': '<:stuck_out_tongue:946951696460959754>',
    'esh': '<:people_wrestling:946951809510039562>',
}

module.exports = {
    readData() {
        let aitaData = fs.readFileSync("data/aita.json", "utf-8");

        // Parse into obj
        aitaData = JSON.parse(aitaData);

        return aitaData;
    },
    writeData(postId, voteData) {
        let aitaData = fs.readFileSync("data/aita.json", "utf-8");

        // Parse into obj
        aitaData = JSON.parse(aitaData);

        // Update with new data
        let post = aitaData[postId]
        if (post) {
            // Exists, update data
            // console.log("updaing existing post")
            post.votes = voteData;
        } else {
            // console.log("creating new entry")
            // Create new entry
            let postData = {
                post_id: postId,
                votes: {
                    ah: [],
                    nta: [],
                    esh: []
                }
            }

            aitaData[postId] = (postData);
        }

        votes = aitaData[postId].votes;

        // Write to file
        aitaData = JSON.stringify(aitaData, null, 4);
        fs.writeFileSync("data/aita.json", aitaData, "utf-8");
        return votes;

    },
    getPostSavedData(postId) {
        let data = this.readData();
        let post = data[postId];
        if (post) {
            return post;
        }
        return false;
    },
    saveVote(postId, userId, vote) {
        let postData = this.getPostSavedData(postId.substring(1, postId.length - 1));
        if (!postData) return false;
        // console.log(postData)

        // Check if user has voted on this post yet
        for (const [key, value] of Object.entries(postData.votes)) {
            // console.log(value)
            if (value.includes(userId)) {
                // console.log(key, vote)
                if (key == vote) {
                    // User has already voted for this option. Can't vote twice
                    // Do nothing
                    console.log('duplicate vote!');
                    break;
                } else {
                    // Remove user vote from this column
                    let index = value.indexOf(userId);
                    value.splice(index, 1);
                }
            } else {
                // Place vote in appropriate column
                if (key == vote) {
                    value.push(userId)
                }
            }
        }

        // Store vote
        // console.log("votes so far:")
        // console.log(postData.votes)
        let votes = this.writeData(postId, postData.votes);
        return votes;
    },
    abbrToEnglish(abbr) {
        switch (abbr.toLowerCase()) {
            case 'ah':
                return "Asshole";
            case 'nta':
                return "Not the Asshole";
            case 'esh':
                return "Everyone Sucks Here";
        }
    },
    englishToAbbr(english) {
        english = english.toLowerCase();
        if (english.includes('not the asshole')) {
            return "nta";
        } else if (english.includes('asshole')) {
            return "ah";
        } else if (english.includes('everyone sucks here')) {
            return "esh";
        }
    },
    randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    },
    getRandomPeopleEmoji() {
        let randNum = this.randomIntFromInterval(0, peopleEmojis.length - 1);
        return peopleEmojis[randNum];
    },
    getVoteEmoji(vote) {
        return voteEmojis[vote];
    }
}