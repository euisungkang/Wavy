const { Events } = require('discord.js');
const { getVoiceConnection, VoiceConnectionStatus, entersState } = require('@discordjs/voice');
const database = require('../firebaseSDK')

module.exports = {
	name: Events.VoiceStateUpdate,
	async execute(oldState, newState) {

        console.log("Voice updated " + oldState, newState.guild.name);

        let { id } = oldState;

        let oldUserChannel = oldState.channel;
        let newUserChannel = newState.channel;

        // If user enters a channel for the first time
        if (oldUserChannel == null && newUserChannel != null && !(await isBot(oldState.client, id))) {

        // Category ID of arcade: 687839393444397111
        // Category ID of Wavy: 816565807693824031
        if (await channelIsValid(newUserChannel)) {
            database.setTimeJoined(oldState.member.user);
        }

        // If user exits channels
        } else if (oldUserChannel != null && newUserChannel == null && !(await isBot(oldState.client, id))) {
            if (await channelIsValid(oldUserChannel)) {
                calculateTimeSpent(oldState, oldUserChannel.parentId);
            }

        // Moving between channels
        } else if (oldUserChannel != null && newUserChannel != null && !(await isBot(oldState.client, id))) {

            // If moving from valid to non-valid channel
            if ((await channelIsValid(oldUserChannel)) && !(await channelIsValid(newUserChannel))) {
                calculateTimeSpent(oldState, oldUserChannel.parentId);

            // If moving from non-valid to valid channel
            } else if (!(await channelIsValid(oldUserChannel)) && (await channelIsValid(newUserChannel))) {
                database.setTimeJoined(oldState.member.user);
            }
        }
	},
};

async function calculateTimeSpent(oldState, channelID) {
    let now = new Date();
    let joined = await database.getTimeJoined(oldState.member.user);
  
    // getTime returns time in seconds
    let diff = (now.getTime() - joined.getTime()) / 1000;
  
    console.log(Math.round(diff / 60));
  
    //Filter out users less than 5 minutes = 5 * 60
    if (diff > 5 * 60) {
      let amount;
      if (
        channelID == "687839393444397111" ||
        channelID == "816565807693824031"
      ) {
        // Wavy Pay 2 Win
        if (oldState.member.premiumSince != null)
          amount = Math.round(diff / (3 * 60));
        else amount = Math.round(diff / (5 * 60));
      }
      // else if (channelID == '816565807693824031') {
      //     amount = Math.round(diff / (5 * 60));
      // }
      else {
        amount = 0;
      }
  
      let succ = await database.addCurrency(oldState.member.user, amount);
  
      if (succ && await database.checkNotif(oldState.member.user.id)) {
        sendReceipt(oldState, diff, amount);
      }
    }
}

async function sendReceipt(member, time, amount) {
    let wallet = await database.getCurrency(member.member.user.id);
    let cum = await database.getCum(member.member.user.id);

    var today = new Date();
    var date =
      today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  
    var timeFormat = "";
    if (time > 86400) {
      timeFormat = "a very long time <:PepeMonkaOMEGA:814749729538834452>";
    } else {
      timeFormat = new Date(null);
      timeFormat.setSeconds(time);
  
      timeFormat = timeFormat.toISOString().substring(11, 19);
    }

    let embed = getEmbed(wallet, cum, date, amount)
  
    message = await member.member.send({ embeds: [embed] }).catch(err => {
        console.log(member.member.user.id)
        console.log(err)
        return null
    });
}

function getEmbed(wallet, cum, time, amount) {
    let embed = new EmbedBuilder()
      .setColor('#ff6ad5')
      .setTitle("【 𝓦 𝓪 𝓿 𝔂 】  Receipt")
      .setThumbnail("https://i.ibb.co/pwDQn5f/Square-HD.png")
      .setDescription(
        "**" +
          date +
          "**" +
          "\nSession Length: **" +
          time +
          "**" +
          "\n\nCoins made this session: " +
          amount +
          " <:WavyBucks:1178672306999021588>" +
          "\n**Total monthly balance**: " +
          (wallet + amount) +
          " <:WavyBucks:1178672306999021588>" +
          "\n**Cumulative balance**: " +
          (cum + wallet + amount) +
          "<:WavyBucks:1178672306999021588>" +
          "\n\nTo enable/disable automatic receipts after every session:" +
          "\n\xa0\xa0\xa0\xa0\xa0Type **/receipt** in any 【 𝓦 𝓪 𝓿 𝔂 】 text channel"
      );

    return embed
} 

async function isBot(client, id) {
    let user = await client.users.fetch(id);
    return user.bot;
}

async function channelIsValid(channel) {
    // Arcade: 687839393444397111
    // Wavy: 816565807693824031
    // Study: 809345799526809600
    // AFK: 814930846326456420

    let valid =
        (channel.parentId == "687839393444397111" ||
        channel.parentId == "816565807693824031") &&
        channel.id != "809345799526809600" &&
        channel.id != "814930846326456420";

    return valid;
}