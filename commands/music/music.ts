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
  .setDescription('Listen to your songs on 𝓦 𝓪 𝓿 𝔂 radio')
  .addStringOption(option => 
    option.setName('url')
      .setDescription('SoundCloud Track URL')
      .setRequired(true)
  );

export type Song = {
  url: string,
  info: TrackInfo,
};

export type TrackInfo = {
  name: string,
  artist: string,
  thumbnail: string,
};
  
export const queue: Song[] = [];
let radioInteraction: CommandInteraction;
export let radioMessage: EmbedBuilder;
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

  queue.push(
    {
      url: url.value.toString(),
      info: await getTrackInfo(url.value.toString())
    }
  );
  
  console.log(queue);

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

  const song = queue.shift();

  try {
    const stream = await play.stream(song.url);
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
    });

    const player = createAudioPlayer({
      behaviors: {
        noSubscriber: NoSubscriberBehavior.Play,
      },
    });

    const connection = joinVoiceChannel({
      channelId: voiceState.channelId,
      guildId: interaction.guildId!,
      // @ts-expect-error Currently voice is built in mind with API v10 whereas discord.js v13 uses API v9.
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    player.play(resource);
    connection.subscribe(player);

    if (!isPlaying) {
      radioMessage = playingMessage(song.info);
      await interaction.reply({ embeds: [radioMessage] });
      radioInteraction = interaction;
    } else {
      radioInteraction.editReply({ embeds: [updateCurrentSong(song.info)] });
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
    isPlaying = false;
    radioInteraction = null;
    radioMessage = null;
    await interaction.reply("Error playing media: check if soundcloud url is valid"); 
    return;
  }
}

function playingMessage(info: TrackInfo): EmbedBuilder {
  return new EmbedBuilder()
    .setColor('#ff6ad5')
    .setTitle('𝓦 𝓪 𝓿 𝔂  Radio')
    .setThumbnail(info.thumbnail)
    .setFields(
      {
        name: info.name,
        value: info.artist,
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

function updateCurrentSong(info: TrackInfo): EmbedBuilder {
  return radioMessage
    .setThumbnail(info.thumbnail)
    .setFields(
      {
        name: info.name,
        value: info.artist,
      },
    )
    .setFooter({
      text: `${queue.length} tracks in queue`
    });
}

async function getTrackInfo(url: string): Promise<TrackInfo> {
  let sc: SoundCloud = await play.soundcloud(url);

  let info: TrackInfo = {
    name: sc.name,
    artist: sc.user.name,
    thumbnail: 'thumbnail' in sc
      ? sc.thumbnail
      : 'https://i.ibb.co/q7Y9RHy/Square.png'
  };

  return info;
}
