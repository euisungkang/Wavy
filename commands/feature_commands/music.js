const { SlashCommandBuilder } = require('discord.js')
const ytdl = require('ytdl-core-discord');
const play = require('play-dl')

const { joinVoiceChannel, createAudioPlayer, VoiceConnectionStatus, entersState, NoSubscriberBehavior, createAudioResource  } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('Chill to quality 𝓦 𝓪 𝓿 𝔂 lofi beats'),
    async execute(interaction) {

        //console.log(interaction.member.voice.channel)
        let connection = joinVoiceChannel({
            channelId: interaction.member.voice.channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        })

        let stream = await play.stream('https://www.youtube.com/watch?v=rPjez8z61rI')
        //console.log(stream)
        let resource = createAudioResource(stream.stream, {
            inputType: stream.type
        })
        //console.log(resource)

        let player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        })
        
        try {
            //console.log(player)
            await player.play(resource)

            let c = await connection.subscribe(player)
        } catch (error) {
            console.log(error)
            connection.destroy()
        }

        //console.log(c)

        await interaction.reply("Playing the 𝓦 𝓪 𝓿 𝔂 lofi radio");
        setTimeout(() => interaction.deleteReply(), 5000);
    }
}
