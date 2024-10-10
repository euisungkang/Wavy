import {
  CommandInteraction,
  GuildMember,
  SlashCommandBuilder,
  VoiceState,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  Message,
  ActionRowBuilder,
  MessageActionRowComponentBuilder,
} from 'discord.js';
import {
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
  NoSubscriberBehavior,
} from '@discordjs/voice';
import play, { SoundCloud, SoundCloudTrack } from 'play-dl';

export const data = new SlashCommandBuilder()
  .setName('play')
  .setDescription('Listen to your songs on 𝓦 𝓪 𝓿 𝔂 radio')
  .addStringOption(option => 
    option.setName('search-or-url')
      .setDescription('Search Song or play SoundCloud url')
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
let messageRef: Message;
export let radioMessage: EmbedBuilder;
let isPlaying = false;

export async function execute(interaction: CommandInteraction) {
  const voiceState = (interaction.member as GuildMember).voice as VoiceState;

  // If User is not in a voice channel
  if (!voiceState.channelId) {
    await interaction.reply('Connect to a channel and try again');
    return;
  }

  const input = interaction.options.get('search-or-url');

  /* Check if input is empty */
  if (!input && !input.value) {
    await interaction.reply("Song Search or URL is empty"); 
    return;
  } 

  /* Check if query or URL */
  let isURL: boolean = false;
  try {
    new URL(input.value.toString());
    isURL = true;
  } catch (error) {
    isURL = false;
  }

  let info: TrackInfo;
  if (isURL) {
    try {
      const url: string = input.value.toString();
      info = await getTrackInfo(url);

      queue.push(
        {
          url: url,
          info: info,
        }
      );
    } catch (error) {
      await interaction.reply("Invalid SoundCloud url: only SoundCloud Track links are supported");
      return;
    }

    /* Play or add to queue */
    if (!isPlaying) {
      playNext(interaction, voiceState);
    } else {
      messageRef.edit({ embeds: [updateQueue()] });
      await interaction.reply({ embeds: [queueMessage(info)] });
      setTimeout(() => interaction.deleteReply(), 10000);
    }
  /* Search and let user choose song to play */
  } else {
    const query: string = input.value.toString();
    const tracks: SoundCloudTrack[] = await play.search(query, {
      limit: 4,
      source: {
        soundcloud: 'tracks',
      },
    });

    let buttons: ButtonBuilder[] = [];
    tracks.forEach(t => {
      buttons.push(
        new ButtonBuilder()
          .setCustomId(t.id.toString())
          .setLabel(t.name)
          .setStyle(ButtonStyle.Primary)
      );
    });

    const row = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(buttons);

    const cancelRow = new ActionRowBuilder<MessageActionRowComponentBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('cancel')
          .setLabel('Cancel')
          .setStyle(ButtonStyle.Danger)
      );

    await interaction.reply({ 
      embeds: [trackSelectionMessage(tracks)],
      components: [row, cancelRow],
    });

    // /* Play or add to queue */
    // if (!isPlaying) {
    //   playNext(interaction, voiceState);
    // } else {
    //   messageRef.edit({ embeds: [updateQueue()] });
    //   await interaction.reply({ embeds: [queueMessage(info)] });
    //   setTimeout(() => interaction.deleteReply(), 10000);
    // }

    console.log(tracks);
  }
}

async function playNext(
  interaction: CommandInteraction,
  voiceState: VoiceState,
) {
  if (queue.length === 0) {
    isPlaying = false;
    messageRef = null;
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
      messageRef = await interaction.fetchReply();
    } else {
      messageRef.edit({ embeds: [updateCurrentSong(song.info)] });
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
    messageRef = null;
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

function queueMessage(info: TrackInfo): EmbedBuilder {
  return new EmbedBuilder()
    .setColor("#ff6ad5")
    .setTitle('Song Added to 𝓦 𝓪 𝓿 𝔂  Radio')
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

function trackSelectionMessage(tracks: SoundCloudTrack[]): EmbedBuilder {
  let songs = [];
  tracks.forEach(t => {
    songs.push(
      {
        name: t.name,
        value: t.user.name,
      },
    );
  });
  return new EmbedBuilder()
    .setColor("#ff6ad5")
    .setTitle('Select a Song to Add to 𝓦 𝓪 𝓿 𝔂  Radio')
    .setThumbnail('https://i.ibb.co/q7Y9RHy/Square.png')
    .setFields(songs)
    .setFooter({
      text: `${queue.length} tracks in queue`,
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
