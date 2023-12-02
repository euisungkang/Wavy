const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const database = require('../../firebaseSDK')

module.exports = {
    data : new SlashCommandBuilder()
        .setName('send')
        .setDescription('Send your hard earned money to someone!')
        .addUserOption(option =>
            option.setName('recipient')
                .setDescription('Mention @ the recipient')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Amount of money to send')
                .setRequired(true)), 

    async execute(interaction) {
        let recipient = interaction.options.getUser("recipient")
        let amount = interaction.options.getInteger("amount")
        const sender = interaction.user
        console.log(recipient.username)
        console.log(sender.username)
        console.log(amount)

        // If amount is invalid
        if (amount <= 0) {
            await interaction.reply("No..")
            setTimeout(() => interaction.deleteReply(), 5000);
            return
        } else if (recipient == sender) {
            await interaction.reply("Can't send money to yourself")
            setTimeout(() => interaction.deleteReply(), 5000);
            return
        }

        let senderWallet = await database.getCurrency(sender.id);
        let recipientWallet = await database.getCurrency(recipient.id)

        // If sender doesn't have enough money
        if (amount > senderWallet) {
            await interaction.reply("You don't have enough <:WavyBucks:1178672306999021588>!")
            setTimeout(() => interaction.deleteReply(), 5000);
            return
        }

        // Calls to individual wallets in database
        database.removeCurrency(sender, amount);
        database.addCurrency(recipient, amount);

        let recipientReceipt = receiptFormat()
        recipientReceipt.setDescription(
            sender.username + " has sent you " + amount +
            " <:WavyBucks:1178672306999021588>\nYour balance is now " +
            (recipientWallet + amount) + " <:WavyBucks:1178672306999021588>"
        )

        let senderReceipt = receiptFormat()
        senderReceipt.setDescription(
            "You sent " + recipient.username + " " + amount + 
            " <:WavyBucks:1178672306999021588>\nYour balance is now " +
            (senderWallet - amount) + " <:WavyBucks:1178672306999021588>"
        )

        recipient.send({ embeds: [recipientReceipt] });
        sender.send({ embeds: [senderReceipt] })

        await interaction.reply("Transaction successful. Receipts have been sent through DMs.")
        setTimeout(() => interaction.deleteReply(), 5000);

        let log = await client.channels.fetch("826499502403747921");
        log.send(
          "Source: " +
            source.username +
            "   to " +
            user.username +
            "     amount: " +
            amount
        );

        return
    }
}

function receiptFormat() {
    let embed = new EmbedBuilder()
        .setColor("#ff6ad5")
        .setTitle("【 𝓦 𝓪 𝓿 𝔂 】  Transaction Record")
        .setThumbnail("https://i.ibb.co/68Ry6ws/Wavy-1.png")

    return embed
}