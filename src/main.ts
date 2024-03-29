import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { deployCommands } from '../deploy-commands';
import { commands } from '../commands';

declare const module: any;

async function bootstrap() {
  // Nest.js Application
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  // Discord Client
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  // Deploy Commands and Ready Message
  client.once(Events.ClientReady, async (readyClient) => {
    await deployCommands({ guildId: '' });
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  });

  // Run Commands
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;
    console.log(commandName);

    if (commands[commandName as keyof typeof commands]) {
      commands[commandName as keyof typeof commands].execute(interaction);
    }
  });

  await client.login(process.env.DISCORD_TOKEN);

  // Nest.js Hot Reload
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
