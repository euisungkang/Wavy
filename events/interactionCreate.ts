import { CommandInteraction, Events } from 'discord.js';
import { commands } from "../commands";

module.exports = {
    name: Events.InteractionCreate,
    once: false,
    async execute(interaction: CommandInteraction) {
        if (!interaction.isCommand()) return;

        const { commandName } = interaction;
        console.log(commandName);

        if (commands[commandName as keyof typeof commands]) {
            commands[commandName as keyof typeof commands].execute(interaction);
        }
    }
};
