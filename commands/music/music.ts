import {
  CommandInteraction,
  GuildMember,
  SlashCommandBuilder,
  VoiceState,
} from 'discord.js';
import {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  NoSubscriberBehavior,
} from '@discordjs/voice';
import play from 'play-dl';

export const data = new SlashCommandBuilder()
  .setName('music')
  .setDescription('Chill to quality 𝓦 𝓪 𝓿 𝔂 lofi beats')
  .addStringOption(option => 
    option.setName('url')
      .setDescription('SoundCloud Track URL')
      .setRequired(true)
  );
  

export async function execute(interaction: CommandInteraction) {
  const voiceState = (interaction.member as GuildMember).voice as VoiceState;

  // If User is not in a voice channel
  if (!voiceState.channelId) {
    await interaction.reply('not connected to a channel');
    return;
  }

  //const args = interaction.content.split('play ')[1].split(' ')[0]
  const url = interaction.options.get('url');

  if (!url || !url.value) {
    await interaction.reply("Invalid SoundCloud url"); 
    return;
  }

  console.log(url.value.toString());

  try {
    const stream = await play.stream(
      url.value.toString()
    );
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
    });

    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
      },
    });

    // Connect to Voice Channel
    const connection = joinVoiceChannel({
      channelId: voiceState.channelId,
      guildId: interaction.guildId!,
      // @ts-expect-error Currently voice is built in mind with API v10 whereas discord.js v13 uses API v9.
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    player.play(resource);
    connection.subscribe(player);

  } catch (error) {
    console.error(error);
    await interaction.reply("Error playing media: check if soundcloud url is valid"); 
    return;
  }

  // Success Response
  await interaction.reply('Playing 𝓦 𝓪 𝓿 𝔂 lofi radio');
  setTimeout(() => interaction.deleteReply(), 5000);
}
