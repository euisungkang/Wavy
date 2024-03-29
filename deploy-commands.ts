import { REST, Routes } from 'discord.js';
import { commands } from './commands';

const commandsData = Object.values(commands).map((command) => command.data);

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

type DeployCommandsProps = {
  guildId: string;
};

export async function deployCommands({ guildId }: DeployCommandsProps) {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      guildId == ''
        ? Routes.applicationCommands(process.env.CLIENT_ID)
        : Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
      {
        body: commandsData,
      },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
}
