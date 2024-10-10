import { REST, Routes } from 'discord.js';
import { commands } from './commands';

const commandsData = Object.values(commands).map(command => command.data);
const rest = new REST().setToken(process.env.DISCORD_TOKEN!);

type DeployCommandsProps = {
  guildId: string;
};

export async function deployCommands({ guildId }: DeployCommandsProps) {
  try {
    // await rest.put(
    //     Routes.applicationCommands(process.env.CLIENT_ID!),
    //     {
    //       body: []
    //     },
    // );
    // await rest.put(
    //     Routes.applicationGuildCommands(process.env.CLIENT_ID!, guildId),
    //     {
    //       body: []
    //     },
    // );

    await rest.put(
      guildId == ''
        ? Routes.applicationCommands(process.env.CLIENT_ID!)
        : Routes.applicationGuildCommands(process.env.CLIENT_ID!, guildId),
      {
        body: commandsData,
      },
    );

    for (const command of commandsData) {
      console.log(`/${command.name}`);
    }
  } catch (error) {
    console.error(error);
  }
}
