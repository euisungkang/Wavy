const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const database = require('../../firebaseSDK');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('receipt')
		.setDescription('Enable or Disable 𝓦 𝓪 𝓿 𝔂 receipts!'),
	async execute(interaction) {
        let embed = new getEmbed(interaction.user)

        // React with the available choices
        const message = await interaction.reply({ embeds: [embed], fetchReply: true })
        await message.react('✅')
        await message.react('❌')
        await message.react('<:WavyBucks:1178672306999021588>')

        // Filter to only detect one of the three given emoji choices
        const collectorFilter = (reaction, user) => {
            return ['✅', '❌', 'WavyBucks'].includes(reaction.emoji.name) && user.id === interaction.user.id;
        };

        await message.awaitReactions({ filter: collectorFilter, max: 1, time: 30000, errors: ['time'] })
        .then(collected => {
            const reaction = collected.first()

            if (reaction.emoji.name == '✅') {
                message.reply("You've **enabled** 𝓦 𝓪 𝓿 𝔂 receipts!").then(msg => {
                    setTimeout(() => {
                        interaction.deleteReply()
                        msg.delete()
                    }, 5000);
                })
            } else if(reaction.emoji.name == '❌') {
                message.reply("you've **disabled** 𝓦 𝓪 𝓿 𝔂 receipts!").then(msg => {
                    setTimeout(() => {
                        interaction.deleteReply()
                        msg.delete()
                    }, 5000);
                })
            } else if (reaction.emoji.name == 'WavyBucks') {
                message.reply("Settings persisted!").then(msg => {
                    setTimeout(() => {
                        interaction.deleteReply()
                        msg.delete()
                    }, 5000);
                })
            }
        })

        // If user doesn't respond in time, default response
        .catch(collected => {
            message.reply("Timed Out. Try /receipt again if you want to proceed")

            setTimeout(() => {
                interaction.deleteReply()
            }, 5000);
        })
    },
};

// Returns embed format for /receipt
function getEmbed(user) {

    // Returns if user already has receipts enabled
    let enabled = database.checkNotif(user.id);

    let embed = new EmbedBuilder()
    .setColor('#ff6ad5')
    .setTitle("【 𝓦 𝓪 𝓿 𝔂 】  Receipts")
    .setThumbnail('https://i.ibb.co/sPHLCMN/DALL-E-2023-11-27-17-14-20.png')
    .setFooter({
        text: 'Try /help to learn about all 𝓦 𝓪 𝓿 𝔂 commands',
        iconURL: 'https://i.ibb.co/sPHLCMN/DALL-E-2023-11-27-17-14-20.png'
    });

    if (enabled)
        embed.addFields(
            { name: "You have receipts ```enabled```", value: "\u200B"}
        )
    else 
        embed.addFields(
            { name: "You have receipts ```disabled```", value: "\u200B"}
        )

    embed.addFields(
        { name: "Press ✅ if you wish to **enable** 𝓦 𝓪 𝓿 𝔂 receipts\nPress ❌ if you wish to **disable** 𝓦 𝓪 𝓿 𝔂 receipts\nPress <:WavyBucks:1178672306999021588> to keep current settings", value: "\u200B"},
    )

    return embed
}