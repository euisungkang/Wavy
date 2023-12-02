const { Events } = require('discord.js');
const { getVoiceConnection, VoiceConnectionStatus, entersState } = require('@discordjs/voice');

module.exports = {
	name: Events.VoiceStateUpdate,
	async execute(client) {
        console.log("Voice updated " + client.guild.name);

        const connection = getVoiceConnection(client.guild.id);

        //console.log(client)
        //console.log(connection)

        if (connection) {
            connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
                try {
                    await Promise.race([
                        entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
                        entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
                    ]);
                    // Seems to be reconnecting to a new channel - ignore disconnect
                } catch (error) {
                    // Seems to be a real disconnect which SHOULDN'T be recovered from
                    connection.destroy();
                }
            });
        }

        console.log(connection)

	},
};