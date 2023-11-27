const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const database = require('../../firebaseSDK')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('royalty')
        .setDescription('Check who made it to the 【 𝓦 𝓪 𝓿 𝔂 】 𝓡𝓸𝔂𝓪𝓵𝓽𝔂'),
    async execute(interaction) {
        let royalty = [];
        let royaltyIDS = (Object.entries(await database.getRoyalty())).map(([key, value]) => [key, value.id])
    
        const guild = interaction.guild
    
        await royaltyIDS.forEach(async (r, i) => {
            royalty[i] = await guild.members.fetch(r[1], { force: true })
        })
    
        let embed = await getEmbed(royalty, royaltyIDS)
    
        await interaction.reply({ embeds: [embed] })
    }
}

async function getEmbed(royalty, IDS) {
    let embed = new EmbedBuilder()
    .setColor('#ff6ad5')
    .setTitle('【 𝓦 𝓪 𝓿 𝔂 】 Royalty')
    .setThumbnail('https://i.ibb.co/sPHLCMN/DALL-E-2023-11-27-17-14-20.png')
    
    embed.addFields({ name: "These are the <@&813024016776167485> of 𝓦 𝓪 𝓿 𝔂", value: "\u200B" })

    royalty.forEach(async (r, i) => {
        embed.addFields({ name: r.user.username, value: IDS[i][0] })
    })

    return embed
}