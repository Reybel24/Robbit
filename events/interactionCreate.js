const plex = require('../helpers/plex-helper.js');
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


            } else {
                console.log(`${interaction.user.tag} voted ${interaction.customId}`)
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
                await interaction.reply(`${interaction.user.tag} voted **${voteString}**.`);
                // await interaction.followUp({ content: `URL: ${interaction.postUrl}`, ephemeral: true });
                // return interaction.deferUpdate();
            }
        }
    },
};