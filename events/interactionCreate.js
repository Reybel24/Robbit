module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (interaction.isButton()) {
            // console.log(`${interaction.user.tag} in #${interaction.channel.name} click a button.`);
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
        } else {
            console.log(`${interaction.user.tag} in #${interaction.channel.name} triggered an interaction.`);
        }
    },
};