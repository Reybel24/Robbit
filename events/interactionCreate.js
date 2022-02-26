const plex = require('../helpers/plex-helper.js');
const jsonHelper = require('../helpers/json-helper.js');
const hyperbeam = require('../helpers/hyperbeam-helper.js');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isButton()) {
            // Get movie id from embedded data
            if (interaction.customId === "addMovie") {
                const embedData = interaction.message.embeds[0];
                let movieTitle = embedData.title
                // console.log(embedData)
                console.log(interaction)

                // Get movie id
                let movieId = embedData.fields.filter((field) => {
                    return field.name === "TMDB ID";
                })
                if (movieId.length > 0) movieId = movieId[0].value;
                console.log("id is:", movieId)

                // Add to radarr
                const radarr = await plex.addMovie(movieId);

                // Check success
                // console.log('status: ', radarr.status)
                if (radarr.status == '201') {
                    // await interaction.reply(`${movieTitle} will be added to Plex.`);

                    // Creat disabled button to replace with
                    const addButtonDisabled = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('addMovie')
                                .setLabel('Adding movie...')
                                .setStyle('SUCCESS')
                                .setDisabled(true)
                        )

                    // Update button
                    await interaction.update({ content: `${movieTitle} will be added to Plex.`, components: [addButtonDisabled] });
                } else if (radarr.status == '400' && radarr.data[0].errorCode === 'MovieExistsValidator') {
                    await interaction.reply(`${movieTitle} already exists.`);
                } else {
                    await interaction.reply(`${movieTitle} couldn't be added to Plex.`);
                }
            } else if (interaction.customId === "createRoom") {
                console.log('creating watch room');
                const embedData = interaction.message.embeds[0];

                // Get movie rating key
                let ratingKey = embedData.fields.filter((field) => {
                    return field.name === "Rating Key";
                })
                if (ratingKey.length > 0) ratingKey = ratingKey[0].value;
                console.log('rating key: ', ratingKey)

                // Create link to media here using rating key
                const shareableLink = plex.getPlexMediaShareableUrl(ratingKey);

                // Make a new room
                const party = await hyperbeam.createRoom(shareableLink);
                let joinPartyBtn;
                console.log('party response: ', party.status)
                if (party.status == 201) {
                    console.log('room created succesfully!')
                    console.log("party url: ", party.data.embed_url);

                    // Creat join party button button
                    joinPartyBtn = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                // .setCustomId('joinParty')
                                .setLabel('Join Party')
                                .setStyle('LINK')
                                .setURL(`${party.embed_url}`)
                        )

                    // Join party message
                    await interaction.reply({
                        content: `Someone has started a watch party!`,
                        components: [joinPartyBtn]
                    });
                } else {
                    console.log('something went wrong creating room')
                    // console.log(party)

                    await interaction.reply({
                        content: `Watch party couldn't be created <:pensive:946904005911650414>\n(Reason: *${party.data.message}*)`,
                        components: []
                    });
                }


            } else {
                console.log(`${interaction.member.nickname} voted ${interaction.customId}`)
                // console.log(interaction)
                var voteString = "";
                switch (interaction.customId) {
                    case 'ah':
                        voteString = 'asshole (AH)';
                        break;
                    case 'nta':
                        voteString = 'not the asshole (NTA)';
                        break;
                    case 'esh':
                        voteString = 'everyone sucks here (ESH)';
                        break;
                }

                // console.log(interaction)
                // Save vote
                let postId = interaction.message.embeds[0].fields.filter((field) => {
                    return field.name === 'Post ID';
                })
                postId = postId[0].value;
                let updatedVotes = jsonHelper.saveVote(postId, interaction.user.id, interaction.customId);

                // Update message vote fields from file data
                let updatedEmbed = interaction.message.embeds[0];

                for (let i = 0; i < updatedEmbed.fields.length; i++) {
                    let fieldKey = updatedEmbed.fields[i].name;

                    if (jsonHelper.englishToAbbr(fieldKey) == 'ah' || jsonHelper.englishToAbbr(fieldKey) == 'nta' || jsonHelper.englishToAbbr(fieldKey) == 'esh') {

                        // Convert vals to string
                        let votes = updatedVotes[jsonHelper.englishToAbbr(fieldKey)];
                        let votesString = '';
                        if (votes.length > 0) {
                            for (let j = 0; j < votes.length; j++) {
                                let userId = votes[j];
                                let user = await interaction.message.guild.members.fetch(userId);

                                votesString += `${jsonHelper.getRandomPeopleEmoji()} ` + user.nickname;

                                if (j < votes.length - 1) {
                                    // Add line break
                                    votesString += '\n'
                                }
                            }
                        } else {
                            votesString = '<:transparent:946682488896512002>';
                        }

                        updatedEmbed.fields[i].value = votesString;
                    }
                }

                let voteEmoji = jsonHelper.getVoteEmoji(interaction.customId);
                console.log(voteEmoji)

                await interaction.update({ embeds: [updatedEmbed] });
                await interaction.followUp(`${interaction.member.nickname} voted ** ${voteEmoji} ${voteString}**.`);
                // await interaction.followUp({ content: `URL: ${ interaction.postUrl }`, ephemeral: true });
                // return interaction.deferUpdate();
            }
        }
    },
};