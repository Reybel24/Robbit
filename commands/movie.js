const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const plex = require('../helpers/plex-helper.js');
const tautulli = require('../helpers/tautulli-helper.js');
const hyperbeam = require('../helpers/hyperbeam-helper.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('movie')
        .setDescription('Add a movie to plex')
        .addStringOption(option => option.setName('movie').setDescription('Enter a movie').setRequired(true)),
    async execute(interaction) {
        // Add movie to radarr
        const inputMovie = interaction.options.getString('movie');
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
                // .setURL(movieExtractedProperties.shareableUrl)
            )

        let availableOnPlexString = 'Available on <:plex:946685930645905439>'

        // Create embed for each movie
        for (let i = 0; i < radarr.length; i++) {
            let movie = radarr[i];
            let title = movie.title;
            let movieId = movie.tmdbId;
            let movieImdbId = movie.imdbId;
            let movieUrl = `https://www.themoviedb.org/movie/${movieId}`
            let imgUrl = (movie.images.length > 0) ? movie.images[0].remoteUrl : "";
            let isAvailableOnPlex = movie.hasFile;

            // Properties
            var movieExtractedProperties = {
                title: title,
                movieId: movie.tmdbId,
                movieImdbId: movie.imdbId,
                movieUrl: `https://www.themoviedb.org/movie/${movieId}`,
                imgUrl: (movie.images.length > 0) ? movie.images[0].remoteUrl : "",
                isAvailableOnPlex: movie.hasFile,
                ratingKey: null,
                shareableUrl: null,
                embed: null
            }

            // Get shareable link
            let tautulliMediaItem = null;
            if (isAvailableOnPlex) {
                // Get tautulli metadata
                tautulliMediaItem = await tautulli.searchMovie(title, movieImdbId);

                movieExtractedProperties.ratingKey = tautulliMediaItem.rating_key;

                // Construct a shareable plex link using its rating key
                movieExtractedProperties.shareableUrl = plex.getPlexMediaShareableUrl(movieExtractedProperties.ratingKey);
            }

            let ratingsToShow = [];
            if ('imdb' in movie.ratings) {
                let rating = movie.ratings.imdb.value;
                ratingsToShow.push(`<:imdb:946677040151687168> ${rating}`)
            }

            if ('rottenTomatoes' in movie.ratings) {
                let rating = movie.ratings.rottenTomatoes.value;
                ratingsToShow.push(`<:rotten_tomatoes:946677024704053268> ${rating}%`)
            }

            let ratingsString = "";
            if (ratingsToShow.length > 0) {
                for (let i = 0; i < ratingsToShow.length; i++) {
                    ratingsString += ratingsToShow[i];

                    if (i < ratingsToShow.length - 1) {
                        ratingsString += '<:transparent:946682488896512002>'
                    }
                }
            } else {
                ratingsString = 'N/A'
            }

            let genresString = ""
            let maxGenres = 2;
            if (movie.genres.length < 1) {
                genreString = 'N/A'
            } else {
                for (let i = 0; i < movie.genres.length && i < maxGenres; i++) {
                    genresString += movie.genres[i];
                    if ((i < maxGenres - 1) && (movie.genres[i + 1] != undefined)) {
                        genresString += ', '
                    }
                }
            }

            // TODO: create enums for field values

            movieExtractedProperties.embed = new MessageEmbed()
                .setColor('#0099ff')
                .setTitle(movie.title)
                .setURL(movieUrl)
                .setAuthor({ name: 'TMDB', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://www.themoviedb.org/' })
                .setDescription(movie.overview)
                .setThumbnail(imgUrl)
                .addFields(
                    { name: 'Year', value: `${movie.year}`, inline: true },
                    { name: 'Score', value: `${ratingsString}`, inline: true },
                    { name: 'Genre', value: `${genresString}`, inline: true },
                )
                .addField('\u200B', '\u200B')
                .addFields(
                    { name: `${availableOnPlexString}`, value: (isAvailableOnPlex) ? "<:white_check_mark:946690043400052777> Yes" : "<:regional_indicator_x:946690476680024064> No", inline: true },
                    { name: 'TMDB ID', value: `${movieId}`, inline: true },
                    { name: 'Rating Key', value: `${movieExtractedProperties.ratingKey}`, inline: true },
                )
                .setImage(imgUrl)
                .setTimestamp()
                .setFooter({ text: 'Robbit Plex Bot', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

            // Add to embeds list
            movies.push(movieExtractedProperties)
        }

        // Send rest of embeds
        if (movies.length > 1) {
            for (let i = 0; i < movies.length; i++) {
                // const actionsRow = (movies[i].)
                const movie = movies[i];

                let btns = [];

                // Show "Add to Plex" button
                if (!movie.isAvailableOnPlex) btns.push(actionsMovieNotOnPlex);

                // Show "View on Plex" button
                let viewOnPlexBtn = null;
                if (movie.shareableUrl) {
                    // Set button url to this movie
                    viewOnPlexBtn = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                // .setCustomId('goToMovie')
                                .setLabel('View On Plex')
                                .setStyle('LINK')
                                // .setDisabled(true)
                                .setURL(movie.shareableUrl)
                                .setEmoji('946685930645905439')
                        ).addComponents(
                            new MessageButton()
                                .setCustomId('createRoom')
                                .setLabel('Start Watch Party')
                                .setStyle('PRIMARY')
                                .setEmoji('947002671523590204')
                                );

                    btns.push(viewOnPlexBtn);
                    // btns.push(startWatchPartyBtn);
                }

                if (i < 1) {
                    await interaction.reply({ embeds: [movies[0].embed], components: btns });
                } else {
                    await interaction.followUp({ embeds: [movies[i].embed], components: btns });
                }
            }
        }
    },
};