import { SlashCommandBuilder, EmbedBuilder, CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('General help for all / commands in 𝓦 𝓪 𝓿 𝔂!');

export async function execute(interaction: CommandInteraction) {
  const embed = new EmbedBuilder()
    .setColor('#ff6ad5')
    .setTitle('【 𝓦 𝓪 𝓿 𝔂 】  Commands')
    .setThumbnail('https://i.ibb.co/dDkc0RX/Square.png')
    .addFields(
      {
        name: '</wallet:1178672893371097109>',
        value: 'Check your 𝓦 𝓪 𝓿 𝔂 Wallet',
      },
      {
        name: '</market:1180442814350377012>',
        value: 'Buy server perks in the 𝓦 𝓪 𝓿 𝔂  Market!',
      },
      {
        name: '</casino:1184120489845723247>',
        value: 'Play in the 𝓦 𝓪 𝓿 𝔂  Casino, feeling lucky?',
      },
      {
        name: '</edit:1178663787969138718>',
        value: 'Edit your perks from Wavy Market, Raffle, and more!',
      },
      {
        name: '</send:1178676253084110978> ```@recipient``` ```amount```',
        value: 'Send your hard earned <:WavyBucks:1178672306999021588> to someone!',
      },
      {
        name: '</receipt:1180425079188893830>',
        value: 'Enable or Disable 𝓦 𝓪 𝓿 𝔂 receipts!',
      },
    )
    .setFooter({
      text: 'Type commands in any  𝓦 𝓪 𝓿 𝔂  text channel',
      iconURL: 'https://i.ibb.co/dDkc0RX/Square.png'
    });

  return interaction.reply({ embeds: [embed] });
}
