import { Client, Events } from 'discord.js';
import { deployCommands } from "../deploy-commands";

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client: Client) {
        await deployCommands({ guildId: process.env.WAVY_ID! });
        console.log(`Ready! Logged in as ${client.user!.tag}`);
    },
};
