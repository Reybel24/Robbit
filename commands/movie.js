const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const plex = require('../helpers/plex-helper.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('movie')
        .setDescription('Add a movie to plex')
        .addStringOption(option => option.setName('movie').setDescription('Enter a movie').setRequired(true)),
    async execute(interaction) {
        // Add movie to radarr
        const inputMovie = interaction.options.getString('movie');
        console.log("movie input: ", inputMovie);
        const radarr = await plex.searchMovie(inputMovie);

        // Create movie embeds
        var movies = [];

        // Movie not on plex
        const actionsMovieNotOnPlex = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('addMovie')
                    .setLabel('Add To Plex')
                    .setStyle('SUCCESS'),
            )

        // Movie on plex
        const actionsMovieOnPlex = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('goToMovie')
                    .setLabel('View On Plex')
                    .setStyle('SECONDARY')
                    .setDisabled(true)
            )

        // console.log(radarr)

        // Check response
        // if (radarr.status === 400 && radarr.data[0].errorCode === 'MovieExistsValidator') {
        // console.log("Movie already exists!")
        //  messageContent = "Movie alrady exists!"
        // } else {
        //    messageContent = "Hello."
        // }

        // Create embed for each movie
        for (let i = 0; i < radarr.length; i++) {
            let movie = radarr[i];
            let movieId = movie.tmdbId;
            let movieUrl = `https://www.themoviedb.org/movie/${movieId}`
            let imgUrl = (movie.images.length > 0) ? movie.images[0].remoteUrl : "";
            let isAvailableOnPlex = movie.hasFile;
            // TODO: create enums for field values

            console.log("id: ", movieId)

            const movieEmbed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(movie.title)
                .setURL(movieUrl)
                .setAuthor({ name: 'TMDB', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://www.themoviedb.org/' })
                .setDescription(movie.overview)
                .setThumbnail(imgUrl)
                .addFields(
                    { name: 'Available on Plex', value: (isAvailableOnPlex) ? "Yes" : "No" },
                    { name: '\u200B', value: '\u200B' },
                    { name: 'TMDB ID', value: `${movieId}`, inline: true },
                    { name: 'Inline field title', value: 'Some value here', inline: true },
                )
                .addField('Inline field title', 'Some value here', true)
                .setImage(imgUrl)
                .setTimestamp()
                .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

            // Add to embeds list
            movies.push(movieEmbed)
        }

        // Send rest of embeds
        if (movies.length > 1) {
            for (let i = 0; i < movies.length; i++) {
                // const actionsRow = (movies[i].)
                console.log(movies[i])

                // Get is available on plex
                let isAvailable = movies[i].fields.filter((field) => {
                    return field.name === "Available on Plex";
                })
                if (isAvailable.length > 0) isAvailable = isAvailable[0].value;
                console.log("is available:", isAvailable)

                if (i < 1) {
                    await interaction.reply({ embeds: [movies[0]], components: (isAvailable === 'No') ? [actionsMovieNotOnPlex] : [actionsMovieOnPlex] });
                } else {
                    await interaction.followUp({ embeds: [movies[i]], components: (isAvailable === 'No') ? [actionsMovieNotOnPlex] : [actionsMovieOnPlex] });
                }
            }
        }
    },
};