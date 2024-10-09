import {
  CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
} from 'discord.js';
import { queue, radioMessage } from './music';
import type { Song } from './music';

export const data = new SlashCommandBuilder()
  .setName('queue')
  .setDescription('Check the 𝓦 𝓪 𝓿 𝔂 radio queue');
  
export async function execute(interaction: CommandInteraction) {
  console.log(queue);

  if (queue.length > 0) {
    await interaction.reply({ embeds: [radioMessage, queueMessage()] });
  } else {
    await interaction.reply('𝓦 𝓪 𝓿 𝔂  Radio is empty. Type **/music** to get started');
  } 
}

function queueMessage() {
  let fields = [];
  queue.forEach((song: Song) => {
    fields.push(
      {
        name: song.info.name,
        value: song.info.artist,
      }
    );
  });

  return new EmbedBuilder()
    .setColor('#ff6ad5')
    .setTitle('𝓦 𝓪 𝓿 𝔂  Radio Queue')
    .setThumbnail('https://i.ibb.co/q7Y9RHy/Square.png')
    .setFields(fields)
    // .setFooter({
    //   text: `${queue.length} track${queue.length == 1 ? '' : 's'} in queue`,
    // });
}
