import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { events } from "../events";

declare const module: any;

async function bootstrap() {
  // Nest.js Application
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  // Discord Client
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessages,
    ]
  });

  // Map Events
  for (const [name, event] of events) {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }

  await client.login(process.env.DISCORD_TOKEN);

  process.on('unhandledRejection', async (reason, promise) => {
    console.error(`Unhandled Rejection:\nPromise: ${promise}\nReason: ${reason}`);
  });

  process.on('uncaughtException', async (error) => {
    console.error(`Uncaught Exception: ${error}`);
  });

  process.on('uncaughtExceptionMonitor', async (error, origin) => {
    console.error(`Uncaught Exception Monitor:\nError: ${error}\nOrigin: ${origin}`);
  });

  // Nest.js Hot Reload
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
