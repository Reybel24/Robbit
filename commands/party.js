const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const hyperbeamHelper = require('../helpers/hyperbeam-helper.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('party')
        .setDescription('Create a room for you and your friends'),
    async execute(interaction) {
        // Delete all other active rooms
        await hyperbeamHelper.deleteAllActiveRooms();

        // Create new room
        const party = await hyperbeamHelper.createRoom('https://miniclip.com');
        let joinPartyBtn;
        // console.log('party response: ', party.status)
        if (party.status == 200) {
            console.log('room created succesfully!')
            console.log("party url: ", party.data.embed_url);

            // Creat join party button button
            joinPartyBtn = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setLabel('Join Party')
                        .setStyle('LINK')
                        .setURL(`${party.data.embed_url}`)
                        .setEmoji('947007776205443092')
                )

            // Send link to created room
            let username = interaction.member.nickname;
            await interaction.reply({
                content: `**${username}** has started a party! Click to join. <a:twinsparrot:947016068155711548>`,
                components: [joinPartyBtn]
            });
        }
    }
};