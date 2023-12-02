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
          "https://i.ibb.co/68Ry6ws/Wavy-1.png"
        )
        .addFields(
          {
            name: "</wallet:1178672893371097109>",
            value: "Check your 𝓦 𝓪 𝓿 𝔂 Wallet"
          },
          {
            name: "</market:1180442814350377012>",
            value: "Buy server perks in the 𝓦 𝓪 𝓿 𝔂  Market!"
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
          iconURL: 'https://i.ibb.co/68Ry6ws/Wavy-1.png'
        });

        await interaction.reply({ embeds: [embed] })
	},
};