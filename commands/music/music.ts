import {
  CommandInteraction,
  GuildMember,
  SlashCommandBuilder,
  VoiceState,
  EmbedBuilder,
} from 'discord.js';
import {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  NoSubscriberBehavior,
} from '@discordjs/voice';
import play, { SoundCloud } from 'play-dl';

export const data = new SlashCommandBuilder()
  .setName('music')
  .setDescription('Chill to quality 𝓦 𝓪 𝓿 𝔂 lofi beats')
  .addStringOption(option => 
    option.setName('url')
      .setDescription('SoundCloud Track URL')
      .setRequired(true)
  );
  
const queue: string[] = [];
let radioInteraction: CommandInteraction;
let radioMessage: EmbedBuilder;
let isPlaying = false;

export async function execute(interaction: CommandInteraction) {
  const voiceState = (interaction.member as GuildMember).voice as VoiceState;

  // If User is not in a voice channel
  if (!voiceState.channelId) {
    await interaction.reply('not connected to a channel');
    return;
  }

  const url = interaction.options.get('url');

  if (!url || !url.value) {
    await interaction.reply("Invalid SoundCloud url"); 
    return;
  }

  queue.push(url.value.toString());
  // console.log(queue);
  
  if (!isPlaying) {
    playNext(interaction, voiceState);
  } else {
    radioInteraction.editReply({ embeds: [updateQueue()] });
    await interaction.reply('Added 𝓦 𝓪 𝓿 𝔂 music queue');
    setTimeout(() => interaction.deleteReply, 5000);
  }
}

async function playNext(
  interaction: CommandInteraction,
  voiceState: VoiceState,
) {
  if (queue.length === 0) {
    isPlaying = false;
    radioInteraction = null;
    radioMessage = null;
    return;
  }

  const url = queue.shift();

  try {
    let soundcloud: SoundCloud = await play.soundcloud(url);
    const stream = await play.stream(url);
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
    });

    // console.log(soundcloud);

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

    if (!isPlaying) {
      radioMessage = playingMessage(soundcloud);
      await interaction.reply({ embeds: [radioMessage] });
      radioInteraction = interaction;
    } else {
      radioInteraction.editReply({ embeds: [updateCurrentSong(soundcloud)] });
    }

    isPlaying = true;

    // Event listener for when the audio player becomes idle (track finished playing)
    player.on('stateChange', (oldState, newState) => {
      if (oldState.status !== 'idle' && newState.status === 'idle') {
        playNext(interaction, voiceState);
      }
    });
  } catch (error) {
    console.error(error);
    await interaction.reply("Error playing media: check if soundcloud url is valid"); 
    return;
  }
}

function playingMessage(info: SoundCloud): EmbedBuilder {
  return new EmbedBuilder()
    .setColor('#ff6ad5')
    .setTitle('𝓦 𝓪 𝓿 𝔂  Radio')
    .setThumbnail(
      'thumbnail' in info
        ? info.thumbnail
        : 'https://i.ibb.co/q7Y9RHy/Square.png'
    )
    .setFields(
      {
        name: info.name,
        value: info.user.name,
      },
    )
    .setFooter({
      text: `${queue.length} track${queue.length == 1 ? '' : 's'} in queue`,
    });
}

function updateQueue(): EmbedBuilder {
  return radioMessage
    .setFooter({
      text: `${queue.length} tracks in queue`,
    });
}

function updateCurrentSong(info: SoundCloud): EmbedBuilder {
  return radioMessage
    .setFields(
      {
        name: info.name,
        value: info.user.name,
      },
    )
    .setFooter({
      text: `${queue.length} tracks in queue`
    });
}

