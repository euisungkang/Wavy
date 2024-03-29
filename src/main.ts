import { readdirSync } from 'node:fs';
import { join }from 'node:path';
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
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  // Map Events
  for (const [name, event] of events) {
    console.log(`${name}: ${event}`);

    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  }

  await client.login(process.env.DISCORD_TOKEN);

  // Nest.js Hot Reload
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
