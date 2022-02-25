const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const reddit = require('../reddit-helper.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aita')
        .setDescription('Shows a random post from r/AITA'),
    async execute(interaction) {
        // Fetch post from reddit
        const post = await reddit.getRandomPost();

        // Cut text if too long
        const charLimit = 5000;
        const postBody = post.selftext.substring(0, charLimit);

        // Create option buttons
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('ah')
                    .setLabel('AH')
                    .setStyle('DANGER'),
            ).addComponents(
                new MessageButton()
                    .setCustomId('nta')
                    .setLabel('NTA')
                    .setStyle('PRIMARY')
            ).addComponents(
                new MessageButton()
                    .setCustomId('esh')
                    .setLabel('ESH')
                    .setStyle('SECONDARY')
            );

        // console.log("POST:", post.title)

        // Store post link
        const url = post.url;
        // interaction.postUrl = post.url;
        // interaction.update({ postUrl: post.url })

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(post.title)
            .setURL(url)
            .setAuthor({ name: 'r/AITA', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://www.reddit.com/r/AmItheAsshole/' })
            .setDescription(postBody)
            // .setThumbnail(imgUrl)
            .addFields(
                { name: '\u200B', value: '\u200B' },
                { name: 'Posted by', value: post.author, inline: true },
                // { name: '\u200B', value: '\u200B' },
                { name: 'Upvotes', value: `${post.ups}`, inline: true },
                // { name: 'Inline field title', value: 'Some value here', inline: true },
            )
            // .addField('Inline field title', 'Some value here', true)
            // .setImage(imgUrl)
            .setTimestamp()
            .setFooter({ text: 'Reddit', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

        // await interaction.reply({ content: `[${post.title}](${url})\nby** ${post.author}**\n${post.ups} upvotes\n${postBody}`, components: [row] });
        await interaction.reply({ embeds: [embed], components: [row] });
    },
};