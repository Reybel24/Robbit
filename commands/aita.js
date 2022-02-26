const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const reddit = require('../reddit-helper.js');
const jsonHelper = require('../helpers/json-helper.js');

// Threads will be created within this channel
const channelId = '944884168100315136';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aita')
        .setDescription('Shows a random post from r/AITA'),
    async execute(interaction) {
        // Fetch post from reddit
        const post = await reddit.getRandomPost();

        // console.log(interaction.client)
        const client = interaction.client;
        let channel;
        await client.channels.fetch(channelId)
            .then(chn => channel = chn)
            .catch(console.error);

        // Make sure we are not inside a thread
        // console.log("channel is thread: ", channel.isThread())

        const thread = await channel.threads.create({
            name: post.title,
            autoArchiveDuration: 60,
            reason: '',
        });

        console.log(`Created thread: ${thread.name}`);

        // Bot join thread
        if (thread.joinable) await thread.join();

        // console.log(`Created thread: ${thread.name}`);

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

        // Check for voting data from json file

        jsonHelper.writeData(post.id);

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(post.title)
            .setURL(url)
            .setAuthor({ name: 'r/AITA', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://www.reddit.com/r/AmItheAsshole/' })
            .setDescription(postBody)
            // .setThumbnail(imgUrl)
            .addFields(
                { name: '\u200B', value: '\u200B' },
                { name: 'Posted by', value: `<:reddit:947031868702871589> ${post.author}`, inline: true },
                // { name: '\u200B', value: '\u200B' },
                { name: 'Upvotes', value: `<:upvote:947029838168997889> ${post.ups}`, inline: true },
                { name: 'Post ID', value: `*${post.id}*`, inline: true },
            )
            .addFields(
                { name: '\u200B', value: '\u200B' },
                { name: '<:peach:946951424980447282> Asshole', value: '<:transparent:946682488896512002>', inline: true },
                { name: '<:stuck_out_tongue:946951696460959754> Not the Asshole', value: '<:transparent:946682488896512002>', inline: true },
                { name: '<:people_wrestling:946951809510039562> Everyone Sucks Here', value: '<:transparent:946682488896512002>', inline: true },
            )
            // .addField('Inline field title', 'Some value here', true)
            // .setImage(imgUrl)
            .setTimestamp()
            .setFooter({ text: 'Reddit', iconURL: 'https://i.imgur.com/AfFp7pu.png' });

        // Get message by id
        // msg.channel.messages.fetch("701574160211771462")
        // .then(message => console.log(message.content))
        // .catch(console.error);

        // Send message in thread
        thread.send({ embeds: [embed], components: [row] });

        // let msg = await interaction.reply({ embeds: [embed], components: [row] });
        await interaction.reply({ content: `**${interaction.member.nickname}** created a new thread. <:thinking:947030764183244820>` });
    }
};