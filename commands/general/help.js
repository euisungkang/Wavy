const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('General help for all / commands in 𝓦 𝓪 𝓿 𝔂!'),
	async execute(interaction) {
        let embed = new EmbedBuilder()
        .setColor("#ff6ad5")
        .setTitle("【 𝓦 𝓪 𝓿 𝔂 】  Commands")
        .setThumbnail(
          "https://i.ibb.co/sPHLCMN/DALL-E-2023-11-27-17-14-20.png"
        )
        .addFields(
          {
            name: "</help:1178656904835240039>",
            value: "Check your 𝓦 𝓪 𝓿 𝔂 Wallet"
          },
          {
            name: "</edit:1178663787969138718>",
            value: "Edit your perks from Wavy Market, Raffle, and more!"
          },
          {
            name: "</send:1178676253084110978> ```@recipient``` ```amount```",
            value: "Send your hard earned <:WavyBucks:1178672306999021588> to someone!"
          },
          {
            name: "</receipt:1180425079188893830>",
            value:
              "Enable or Disable 𝓦 𝓪 𝓿 𝔂 receipts!",
          },
        )
        .setFooter({
          text: "Type commands in any  𝓦 𝓪 𝓿 𝔂  text channel",
          iconURL: 'https://i.ibb.co/sPHLCMN/DALL-E-2023-11-27-17-14-20.png'
        });

        await interaction.reply({ embeds: [embed] })
	},
};