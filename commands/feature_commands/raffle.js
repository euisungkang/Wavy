const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const database = require('../../firebaseSDK')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('raffle')
        .setDescription('Win giftcards, coupons, and more irl rewards!'),
    async execute(interaction) {
        let winnerFound = await database.getWinner();
        let r = await database.getRaffle();
        let embed = getEmbed(r);

        if (winnerFound) {
            let message = await interaction.reply({ embeds: [embed], fetchReply: true })
            setTimeout(() => interaction.deleteReply(), 5000)
            return     
        }

        console.log("OK")

        let message = await interaction.reply({ embeds: [embed], fetchReply: true })
        await message.react('<:WavyBucks:1178672306999021588>')

        const collectorFilter = (reaction, user) => {
            return ['WavyBucks'].includes(reaction.emoji.name) && user.id === interaction.user.id;
        }

        await message.awaitReactions({ filter: collectorFilter, max: 1, time: 30000, errors: ['time'] })
        .then(async collected => {
            const reaction = collected.first()

            if (reaction.emoji.name == 'WavyBucks') {
                await ticketPurchase(interaction.user, interaction.channel)
            }

        })
        .catch(collected => {
            message.reply("Timed Out. Try /raffle again if you want to proceed")
        })

        let wch = await interaction.client.channels.cache.get('962365291109707797')
        startRaffleTimer(wch, message)

        setTimeout(() => interaction.deleteReply(), 5000);
    }
}

function getEmbed(r) {
  let timeleft = getRawTime(r);
  let time = new Date(r.CD.toDate().getTime()).toUTCString();

  let embed = new EmbedBuilder()
    .setColor("#ff6ad5")
    .setTitle("【 𝓦 𝓪 𝓿 𝔂 】  Raffle")
    .setThumbnail("https://i.ibb.co/vL8JLvJ/Square.png")
    .setDescription(
      "@everyone A new raffle is open!\n**" +
        r.name +
        "**\nYou are free to spend your Hentai Coins <:WavyBucks:1178672306999021588> to buy tickets." +
        "\n```\n" +
        r.description.replace(/\\n/g, "\n") +
        "\n```" +
        "\nCost per Ticket:  **" +
        r.cost_per_ticket +
        "** <:WavyBucks:1178672306999021588>" +
        "\nMax Tickets per Person:  **" +
        r.max_tickets +
        "**"
    )
    .addFields(
      {
        name: "Total Tickets Purchased So Far: " + r.all_tickets.length,
        value: "\u200B",
      },
      {
        name: "To purchase tickets, click the <:WavyBucks:1178672306999021588> below",
        value: "\u200B",
      },
      {
        name: "Countdown Until Raffle Draw",
        value: "```fix\n" + timeFormat(timeleft) + "\n```*" + time + "*",
      }
    )

  return embed;
}

async function startRaffleTimer(winnerChannel, msg, interaction) {
  let r = await database.getRaffle();
  let embed = await getEmbed(r);
  let timeLeft = getRawTime(r);

  interval = setInterval(async () => {
    if (timeLeft <= 600000 && timeLeft > 590001)
      alertCandidates(interaction);

    if (timeLeft <= 0) {
      pickWinner(winnerChannel);
      embed.fields.forEach((field) => {
        if (field.name == "Countdown Until Raffle Draw")
          field.value = "```fix\nclosed\n```";
      });

      msg.edit({ embeds: [embed] });
      clearInterval(interval);
      return;
    }

    msg.edit({ embeds: [embed] });

    r = await database.getRaffle();
    embed = await getEmbed(r, embed);

    timeLeft -= 10000;
  }, 10000);
}

//   awaitRaffleReaction(msg, channel, filter, logs);

//   startRaffleTimer(winnerChannel, msg, sendMessage);
// }

// // Await reactions on raffle messages, recursive
// async function awaitRaffleReaction(message, channel, filter, logs) {
//   console.log("awaiting reaction");
//   let user;

//   await message
//     .awaitReactions(filter, { max: 1 })
//     .then(async (collected) => {
//       user = collected.first().users.cache.last();
//       await message.reactions.cache
//         .find((r) => r.emoji.id == "814968693981184030")
//         .users.remove(user);
//     })
//     .catch((err) => console.log(err));

//   await ticketPurchase(user, channel, logs).catch((err) => console.log(err));

//   awaitRaffleReaction(message, channel, filter, logs);
// }

async function ticketPurchase(user, channel) {
  let raffle = await database.getRaffle();
  let tickets = raffle.tickets_per_user;

  let max_user = Math.trunc(
    (await database.getCurrency(user.id)) / raffle.cost_per_ticket
  );
  let available = Math.min(max_user, raffle.max_tickets);

  let todelete = [];

  const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

  // If user already bought max tickets
  if (user.id in tickets && tickets[user.id] >= raffle.max_tickets) {
    let max_tix = await channel.send(
      "You already purchased the max number of tickets"
    );
    todelete.push(max_tix);

    await wait(3000);

    channel.bulkDelete(todelete);

    return false;

    // If user already bought tickets, but isn't maxed
  } else if (available == 0) {
    let max_tix = await channel.send(
      "You can't even afford one ticket <:PepePathetic:804088638140710922>"
    );
    todelete.push(max_tix);

    await wait(3000);

    channel.bulkDelete(todelete);

    return false;
  } else if (user.id in tickets && tickets[user.id] < raffle.max_tickets) {
    available = Math.min(available, raffle.max_tickets - tickets[user.id]);
  }

  let amount = await channel.send(
    "<@" +
      user.id +
      "> You can purchase **" +
      available +
      "** ticket(s). How many tickets would you like to purchase? Your balance is: **" +
      (await database.getCurrency(user.id)) +
      "** <:WavyBucks:1178672306999021588>.\n You can type 'all' to purchase as many tickets as you can afford."
  );
  todelete.push(amount);

  let filter = (m) => m.author.id == user.id;
  let collected = await channel
    .awaitMessages(filter, { max: 1, time: 30000, errors: ["time"] })
    .catch(async (err) => {
      console.error(err);

      const wait = (delay) =>
        new Promise((resolve) => setTimeout(resolve, delay));
      await wait(3000);

      channel.bulkDelete(todelete);
      return null;
    });
  if (collected == null) return false;

  todelete.push(await channel.messages.fetch(collected.first().id));

  //Handles valid input and currency charge
  let response = await calculateCurrency(
    raffle,
    channel,
    collected,
    user
  );

  channel.bulkDelete(todelete);

  return response;
}

async function calculateCurrency(raffle, channel, message, user) {
  let wallet = await database.getCurrency(user.id);

  const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));
  let buffer = null;

  // If input is not a valid number
  if (isNaN(message.first().content) && message.first().content != "all") {
    buffer = await channel.send(
      "Please enter a valid number <:PogO:804089420020973568>"
    );
    await wait(3000);
    buffer.delete();
    return false;

    // If input is 0
  } else if (Number(message.first().content) == 0) {
    buffer = await channel.send(
      "If you're gonna buy 0 tickets, don't waste my time"
    );
    await wait(3000);
    buffer.delete();
    return false;

    // If user doesn't have enough money to buy at least 1 ticket
  } else if (wallet < raffle.cost_per_ticket) {
    buffer = await channel.send(
      "You don't have enough <:WavyBucks:1178672306999021588>. Broke ass bitch"
    );
    await wait(3000);
    buffer.delete();
    return false;
  } else if (Number(message.first().content) < 0) {
    if (user.id == "232394108524691457") {
      buffer = await channel.send("Nice try Yuji");
      await wait(3000);
      buffer.delete();
      return false;
    } else {
      buffer = await channel.send("I don't think negative coins exist");
      await wait(3000);
      buffer.delete();
      return false;
    }
  } else if (Number(message.first().content) % 1.0 != 0.0) {
    buffer = await channel.send("wtf man");
    await wait(3000);
    buffer.delete();
    return false;
  }

  // If user enters 'all'
  let remaining;
  let purchased = await database.getTicketsPurchased(user.id);
  let max = Math.min(
    raffle.max_tickets - purchased,
    Math.trunc(wallet / raffle.cost_per_ticket)
  );
  if (message.first().content == "all") {
    remaining = wallet - max * raffle.cost_per_ticket;

    // Logs of the transaction
    // logs.send(
    //   "```" +
    //     new Date().toUTCString() +
    //     "\nRaffle: " +
    //     raffle.name +
    //     "\nID: " +
    //     user.id +
    //     "     Name: " +
    //     user.username +
    //     "\nAmount: " +
    //     max +
    //     "     Cost/T: " +
    //     raffle.cost_per_ticket +
    //     "\nWallet B/A: " +
    //     wallet +
    //     " | " +
    //     remaining +
    //     "```"
    // );

    // Subtract from User's wallet
    database.removeCurrency(user, max * raffle.cost_per_ticket);

    // Add to tickets_per_user array
    database.addTicketsPurchased(user.id, max);

    // Add to all_tickets
    database.addAllTickets(user.id, max);

    buffer = await channel.send(
      "You purchased a total of " +
        max +
        " tickets. Your remaining balance is: " +
        remaining +
        " <:WavyBucks:1178672306999021588>"
    );
    await wait(3000);
    buffer.delete();
    return true;
  }

  // If user enters a valid number
  let amount = Number(message.first().content);
  if (amount > max) {
    buffer = await channel.send(
      "Please check again how many <:WavyBucks:1178672306999021588> you can purchase"
    );
    await wait(3000);
    buffer.delete();
    return false;
  } else {
    remaining = wallet - amount * raffle.cost_per_ticket;

    // logs.send(
    //   "```\n" +
    //     new Date().toUTCString() +
    //     "\nRaffle: " +
    //     raffle.name +
    //     "\nID: " +
    //     user.id +
    //     "     Name:" +
    //     user.username +
    //     "\nAmount: " +
    //     amount +
    //     "     Cost/T: " +
    //     raffle.cost_per_ticket +
    //     "\nWallet B/A: " +
    //     wallet +
    //     " | " +
    //     remaining +
    //     "\n```"
    // );

    // Subtract from User's wallet
    database.removeCurrency(user, amount * raffle.cost_per_ticket);

    //Add to tickets_per_user array
    database.addTicketsPurchased(user.id, amount);

    //Add to all_tickets
    database.addAllTickets(user.id, amount);

    buffer = await channel.send(
      "You purchased a total of " +
        amount +
        " tickets. Your remaining balance is: " +
        remaining +
        " <:WavyBucks:1178672306999021588>"
    );
    await wait(3000);
    buffer.delete();
    return true;
  }
}

// Raffle Winner Channel: 962365291109707797
async function pickWinner(channel) {
  let allTickets = await database.getAllTickets();
  let raffleName = await database.getRaffleName();

  let winner = allTickets[Math.floor(Math.random() * allTickets.length)];

  let winnerTicketsPurchased = await database.getTicketsPurchased(winner);

  const wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

  let text =
    "@everyone The winner's draw for **" +
    raffleName +
    "** is starting\n🔀 Shuffling all **" +
    allTickets.length +
    "** tickets\n";
  let msg = await channel.send(text);
  await wait(5000);

  text += "🦠 Sending unicode mainframe into the ~~virus~~ program\n";
  msg.edit(text);
  await wait(5000);

  text += "💉 Creating new COVID-19 vaccine, optimized trajectory for Mars\n";
  msg.edit(text);
  await wait(5000);

  const random = Math.floor(Math.random() * (101 - 50)) + 50;
  text +=
    "⚛️ Nuclear Fission Atomic Reconstruction Process: **" +
    random.toString() +
    "%** ✔️\n";
  msg.edit(text);
  await wait(5000);

  text += "🏆 Drawing the Winning Ticket!\n";
  msg.edit(text);
  await wait(5000);

  text += "The winner is";
  msg.edit(text);
  await wait(1000);

  text += ".";
  msg.edit(text);
  await wait(1000);

  text += ".";
  msg.edit(text);
  await wait(1000);

  text += ".";
  msg.edit(text);
  await wait(5000);

  text +=
    "\n\n**<@" +
    winner +
    ">** with " +
    winnerTicketsPurchased +
    " tickets. Congratulations!  \n*The prize will be distributed shortly*";
  msg.edit(text);

  database.setWinner();
}

function getRawTime(r) {
  // Get End Date + Time
  let countDownDate = r.CD.toDate().getTime();

  let now = new Date().getTime();
  let timeleft = countDownDate - now;
  return timeleft;
}

function timeFormat(t) {
  let d = Math.floor(t / (1000 * 60 * 60 * 24));
  let h = Math.floor((t % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let m = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
  let s = Math.floor((t % (1000 * 60)) / 1000);

  return (
    d.toString() +
    " days   " +
    ("0" + h).slice(-2) +
    ":" +
    ("0" + m).slice(-2) +
    ":" +
    ("0" + s).slice(-2)
  );
}

async function alertCandidates(interaction) {
  console.log("Sending alerts");
  let users = await database.getAllCandidates();
  let name = await database.getRaffleName();

  let embed = new EmbedBuilder()
    .setColor('#ff6ad5')
    .setTitle("【 𝓦 𝓪 𝓿 𝔂 】  Raffles")
    .setThumbnail("https://i.ibb.co/vL8JLvJ/Square.png")
    .setDescription(
      "The raffle for **" +
        name +
        "** is closing in 10 minutes" +
        "\n**We're about to pick a winner!**" +
        "\n\nPlease go to the #raffle-winners channel to see if you won\n"
    );

  for (let i = 0; i < users.length; i++) {
    let purchased =
      "**" + (await database.getTicketsPurchased(users[i])).toString() + "**";
    embed.addFields({ name: "Tickets Purchased: ", value: purchased });
    let u = await interaction.client.users.cache.get(users[i])
    u.send({ embeds: [embed] })
  }
}