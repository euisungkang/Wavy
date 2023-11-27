const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const database = require('../../firebaseSDK')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wallet')
        .setDescription('Check your 𝓦 𝓪 𝓿 𝔂 Wallet'),
    async execute(interaction) {
        let wallet = await database.getCurrency(interaction.user.id);
        let cum = await database.getCum(interaction.user.id);

        var today = new Date();

        var date =
        today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();

        let embed = new EmbedBuilder()
        .setTitle("【 𝓦 𝓪 𝓿 𝔂 】  Wallet")
        .setThumbnail("https://i.ibb.co/sPHLCMN/DALL-E-2023-11-27-17-14-20.png")
        .setDescription(
            "*Date: " +
            date +
            "*\n\nYour **monthly** earnings: " +
            wallet +
            " <:WavyBucks:1178672306999021588>" +
            "\nYour **cumulative** earnings: " +
            cum +
            " <:WavyBucks:1178672306999021588>"
        );

        interaction.user.send({ embeds: [embed] });

        await interaction.reply("Your 𝓦 𝓪 𝓿 𝔂 Wallet details have been sent!")
        setTimeout(() => interaction.deleteReply(), 5000);
    }
}

