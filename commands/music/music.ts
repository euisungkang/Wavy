import { CommandInteraction, GuildMember, SlashCommandBuilder, VoiceState } from 'discord.js';
import { createAudioPlayer, createAudioResource, joinVoiceChannel, NoSubscriberBehavior } from '@discordjs/voice';
import play from 'play-dl';

export const data = new SlashCommandBuilder()
  .setName('music')
  .setDescription('Chill to quality 𝓦 𝓪 𝓿 𝔂 lofi beats');

export async function execute(interaction: CommandInteraction) {
  const voiceState = (interaction.member as GuildMember).voice as VoiceState;

  // If User is not in a voice channel
  if (!voiceState.channelId) {
    await interaction.reply('not connected to a channel');
    return;
  }

  // Connect to Voice Channel
  const connection = joinVoiceChannel({
    channelId: voiceState.channelId,
    guildId: interaction.guildId,
    adapterCreator: interaction.guild.voiceAdapterCreator,
  });

  // Configure Audio for Stream + Player
  const stream = await play.stream(
    'https://www.youtube.com/watch?v=rPjez8z61rI',
  );

  const resource = createAudioResource(stream.stream, {
    inputType: stream.type,
  });

  const player = createAudioPlayer({
    behaviors: {
      noSubscriber: NoSubscriberBehavior.Play,
    },
  });

  // Try to connect stream to VC
  try {
    player.play(resource);
    connection.subscribe(player);
  } catch (error) {
    console.error(error);
    connection.destroy();
  }

  // Success Response
  await interaction.reply('Playing 𝓦 𝓪 𝓿 𝔂 lofi radio');
  setTimeout(() => interaction.deleteReply(), 5000);
}
