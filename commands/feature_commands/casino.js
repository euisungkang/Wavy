const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const database = require('../../firebaseSDK')
const rps = require('./games/rps')
const BAW = require('./games/baw')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('casino')
        .setDescription('Play in the 𝓦 𝓪 𝓿 𝔂  Casino, feeling lucky?'),
    async execute(interaction) {
        let embed = await getEmbed()

        let message = await interaction.reply({ embeds: [embed], fetchReply: true })
        await message.react('🌓')
        await message.react('✊')
        await message.react('♦')
        await message.react('🃏')

        const collectorFilter = (reaction, user) => {
            return ['🌓', '✊', '♦', '🃏'].includes(reaction.emoji.name) && user.id === interaction.user.id;
        }

        await message.awaitReactions({ filter: collectorFilter, max: 1, time: 30000, errors: ['time']})
        .then(async collected => {
            const reaction = collected.first()
            let client = interaction.client
            let channel = interaction.channel
            let user = interaction.user

            //Play Game
            if (reaction.emoji.name == '🌓') {
                let playerArray = await multiplayerBAWRegister(client, channel, user);
                if (playerArray[0] != null) {
                    await BAW.playBlackAndWhite(channel, user, playerArray[0], playerArray[1])
                }

            //✊✋✌
            } else if (reaction.emoji.name == '✊') {
                let multiplayer = true;
                let playerArray = await multiplayerRPSRegister(client, channel, user);
                let house = await client.users.fetch("1178607553433845774")

                if (playerArray[1] == null) {
                    playerArray[1] = house;
                    multiplayer = false
                }
                if (playerArray[0] != null) {
                    await rps.playRPS(client, channel, user, playerArray, multiplayer)
                }
            }

        })
        .catch(collected => {
            message.reply("Timed Out. Try /casino again if you want to proceed")
        })

        setTimeout(() => interaction.deleteReply(), 5000);
    },
}

function getEmbed() {
    const embed = new EmbedBuilder()
    .setColor('#ff6ad5')
	.setTitle("【 𝓦 𝓪 𝓿 𝔂 】  Casino")
	.setDescription("Welcome to the casino.\n"
                  + "You'll lose your life savings, or earn enough to retire for life\n"
                  + "Click the emoji of the game you'd like to play")
	.setThumbnail('https://i.ibb.co/4FyLqWj/Square-HD.png')
	.addFields(
        { name: "Black and White: 🌓", value: '```yaml\nOnline, with penalty\n```' },
        { name: "Rock Paper Scissors: ✊", value: '```yaml\nOnline, with penalty\n```' },
        { name: "Blackjack: ♦", value: '```diff\n-Offline\n```'},
        { name: "Poker: 🃏", value: '```diff\n-Offline\n```'}
    )

    return embed
}

async function multiplayerBAWRegister(client, channel, player1) {
    let toreturn = []

    let multiplayer = await channel.send({ content: "<@" + player1.id + "> Choose player 2\nPlease mention their name (@𝒬𝓊𝑒𝑒𝓃 𝓌𝒶𝓋𝓎)" })

    let filter = (m) => m.author.id == player1.id;

    // If player1 doesn't respond to player1 prompt
    let collected = await channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
    .catch(async err => {
        multiplayer.delete()
        return null;
    })
    if (collected == null) {
        toreturn[0] = null
        return toreturn
    }

    let player2ID = (collected.first().content).match(/(\d+)/)

    if (player2ID == null) {
        let errMSG = await channel.send({ content: "Please enter a valid player :unamused:" })
        const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
        await wait(3000);
        
        channel.messages.fetch(collected.first().id).then(m => m.delete())
        multiplayer.delete()
        errMSG.delete()

        toreturn[0] = null
        return toreturn;
    }

    let player2 = await client.users.fetch(player2ID[0]).catch(async err => {
        let errMSG = await channel.send({ content: "Please enter a valid player :unamused:" })
        const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
        await wait(3000);

        channel.messages.fetch(collected.first().id).then(m => m.delete())
        multiplayer.delete()
        errMSG.delete()
        
        return null;
    })
    if (player2 == null) {
        toreturn[0] = null
        return toreturn
    }

    sendConfirmation(player2, player1, "Black and White")
    
    let starting_bet = await channel.send({ content: "<@" + player1.id + "> Now choose a starting bet\nPlease enter a number (max 100)" })

    let filter2 = (m) => m.author.id == player1.id;
    let collected2 = await channel.awaitMessages({ filter2, max: 1, time: 30000, errors: ['time']})
    .catch(async err => {
        channel.messages.fetch(collected.first().id).then(m => m.delete())
        multiplayer.delete()
        starting_bet.delete()
        
        return null
    })
    if (collected2 == null) {
        toreturn[0] = null
        return toreturn
    }

    let stb = collected2.first().content;

    if (isNaN(stb) || stb < 1 || stb > 100) {
        let errMSG = await channel.send({ content: "Please enter a valid number <:PikaO:804086658000748584>" })
        const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
        await wait(3000);

        channel.messages.fetch(collected.first().id).then(m => m.delete())
        channel.messages.fetch(collected2.first().id).then(m => m.delete())
        multiplayer.delete()
        starting_bet.delete()
        errMSG.delete()

        toreturn[0] = null
        return toreturn;
    }

    channel.messages.fetch(collected.first().id).then(m => m.delete())
    channel.messages.fetch(collected2.first().id).then(m => m.delete())
    multiplayer.delete()
    starting_bet.delete()

    toreturn.push(player2)
    toreturn.push(stb)

    return toreturn;
}

async function multiplayerRPSRegister(client, channel, player1) {
    let toreturn = []
    let todelete = []
    let player2 = null;

    let multiplayer = await channel.send({ content: "<@" + player1.id + "> Do you wish to play against a player, or the house? (p or h)" })
    todelete.push(multiplayer)

    let filter = (m) => m.author.id == player1.id;

    // If player1 doesn't respond to player1 prompt
    let collected = await channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
    .catch(async err => {
        multiplayer.delete()
        return null;
    })
    if (collected == null) {
        toreturn[0] = null
        return toreturn
    }
    todelete.push(await channel.messages.fetch(collected.first().id))

    let multiplayerDecision = (collected.first().content)
    if (multiplayerDecision == 'p') {
        let playerPrompt = await channel.send({ content: "<@" + player1.id + "> Choose player 2\nPlease mention their name (@𝒬𝓊𝑒𝑒𝓃 𝓌𝒶𝓋𝓎)" })
        todelete.push(playerPrompt)
        
        let playerCollected = await channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
        .catch(async err => {
            channel.bulkDelete(todelete);
            return null;
        })
        if (playerCollected == null) {
            toreturn[0] = null
            return toreturn
        }
        todelete.push(await channel.messages.fetch(playerCollected.first().id))

        let player2ID = (playerCollected.first().content).match(/(\d+)/)

        if (player2ID == null) {
            let errMSG = await channel.send({ content: "Please enter a valid player :unamused:" })
            todelete.push(errMSG);
            const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
            await wait(3000);

            channel.bulkDelete(todelete)
    
            toreturn[0] = null
            return toreturn;
        }

        player2 = await client.users.fetch(player2ID[0]).catch(async err => {
            let errMSG = await channel.send({ content: "Please enter a valid player :unamused:"} )
            todelete.push(errMSG)
            const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
            await wait(3000);
    
            channel.bulkDelete(todelete)
            
            return null;
        })
        if (player2 == null) {
            toreturn[0] = null
            return toreturn
        }

        sendConfirmation(player2, player1, "Rock Paper Scissors")

    } else if (multiplayerDecision == 'h') {
        // Poggers
    } else {
        let errMSG = await channel.send({ content: "Please enter either p or h" })
        todelete.push(errMSG)
        const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
        await wait(3000);
        channel.bulkDelete(todelete)

        toreturn[0] = null
        return toreturn
    } 
    
    // Starting bet and confirmations
    let starting_bet = await channel.send({ content: "<@" + player1.id + "> Now choose a starting bet\nPlease enter a number (max 100)" })
    todelete.push(starting_bet)

    let collected2 = await channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
    .catch(async err => {
        channel.bulkDelete(todelete)
        return null
    })
    if (collected2 == null) {
        toreturn[0] = null
        return toreturn
    }
    todelete.push(await channel.messages.fetch(collected2.first().id))

    let stb = collected2.first().content;

    if (isNaN(stb) || stb < 1 || stb > 100) {
        let errMSG = await channel.send({ content: "Please enter a valid number <:PikaO:804086658000748584>" })
        todelete.push(errMSG)
        const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
        await wait(3000);

        channel.bulkDelete(todelete)
        
        toreturn[0] = null
        return toreturn;
    }

    channel.bulkDelete(todelete)
    toreturn.push(stb)
    toreturn.push(player2)
    return toreturn;
}

async function multiplayerBlackjackRegister(client, channel, player1) {
    let toreturn = []
    toreturn[0] = player1

    let multiplayer = await channel.send({ content: "<@" + player1.id + "> Choose up to 4 additional players, minimum of 1 additional player.\nPlease mention their names (@𝒬𝓊𝑒𝑒𝓃 𝓌𝒶𝓋𝓎 @𝒦𝒾𝓃𝑔 𝓌𝒶𝓋𝓎 @𝔹𝕒𝕖𝕘𝕚 @102)" })

    let filter = (m) => m.author.id == player1.id;

    // If player1 doesn't respond to player1 prompt
    let collected = await channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
    .catch(async err => {
        console.log(err)
        multiplayer.delete()
        return null;
    })
    if (collected == null) {
        toreturn[0] = null
        return toreturn
    }

    let playerArray = (collected.first().content).split(" ");

    //Check if users are valid ID numbers
    for (var i = 0; i < playerArray.length; i++) {
        playerArray[i] = await (playerArray[i]).match(/(\d+)/)[0]

        if (playerArray[i] == null) {
            let errMSG = await channel.send({ content: "Player " + (i + 2) + "'s name is invalid <:PepeYikes:804088050460262470>" })
            const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
            await wait(3000);
            
            channel.messages.fetch(collected.first().id).then(m => m.delete())
            multiplayer.delete()
            errMSG.delete()
    
            toreturn[0] = null
            return toreturn;
        }
    }

    //Check if users exist in server
    for (var i = 0; i < playerArray.length; i++) {
        playerArray[i] = await client.users.fetch(playerArray[i]).catch(async err => {
            let errMSG = await channel.send({ content: "Player " + (i + 2) + " is invalid <:PepeYikes:804088050460262470>" })
            const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
            await wait(3000);
    
            channel.messages.fetch(collected.first().id).then(m => m.delete())
            multiplayer.delete()
            errMSG.delete()
            
            return null;
        })
        if (playerArray[i] == null) {
            toreturn[0] = null
            return toreturn
        }
    }

    let msgArray = []

    for (var i = 0; i < playerArray.length; i++) {
        let starting_bet = await channel.send({ content: "<@" + playerArray[i].id + "> choose a starting bet\nPlease enter a number (max 100)" })
        msgArray.push(starting_bet)

        let filter2 = (m) => m.author.id == playerArray[i].id;
        let collected2 = await channel.awaitMessages({ filter2, max: 1, time: 15000, errors: ['time'] })
        .catch(async err => {
            channel.messages.fetch(collected.first().id).then(m => m.delete())
            multiplayer.delete()
            channel.bulkDelete(msgArray)
        })
        //console.log(collected2)
        msgArray.push(collected2)

        toreturn[i + 1] = playerArray[i]
        //await sendConfirmation(playerArray[i], toreturn[0], "Blackjack")
    }

    // let stb = collected2.first().content;

    // if (isNaN(stb) || stb < 1 || stb > 30) {
    //     let errMSG = await channel.send("Please enter a valid number <:PikaO:804086658000748584>")
    //     const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
    //     await wait(3000);

    //     channel.messages.fetch(collected.first().id).then(m => m.delete())
    //     channel.messages.fetch(collected2.first().id).then(m => m.delete())
    //     multiplayer.delete()
    //     starting_bet.delete()
    //     errMSG.delete()

    //     toreturn[0] = null
    //     return toreturn;
    // }

    channel.messages.fetch(collected.first().id).then(m => m.delete())
    multiplayer.delete()

    return toreturn;
}

async function sendConfirmation(user, source, game) {
    let embed = new EmbedBuilder()
    .setTitle("【 𝓦 𝓪 𝓿 𝔂 】  Casino Confirmation")
    .setAuthor({ name: source.username })
    .setDescription(source.username + " has started a **" + game + "** game! \n\nCheck the 【 𝓦 𝓪 𝓿 𝔂 】 casino to play. \nThe game will automatically quit in 30 seconds unless you click ✅.")
    .setThumbnail('https://i.ibb.co/4FyLqWj/Square-HD.png')

    user.send({ embeds: [embed] });
}