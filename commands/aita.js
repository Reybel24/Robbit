const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const reddit = require('../reddit-helper.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aita')
        .setDescription('Shows a random post from r/AITA'),
    async execute(interaction) {
        // Fetch post from reddit
        const post = await reddit.getRandomPost();

        // Cut text if too long
        const charLimit = 1750;
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

        await interaction.reply({ content: `[${post.title}](${url})\nby** ${post.author}**\n${post.ups} upvotes\n${postBody}`, components: [row] });
    },
};