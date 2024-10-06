import { VoiceState, Events } from 'discord.js';

const networkStateChangeHandler = (oldNetworkState: any, newNetworkState: any) => {
  const newUdp = Reflect.get(newNetworkState, 'udp');
  clearInterval(newUdp?.keepAliveInterval);
}

module.exports = {
  name: Events.VoiceStateUpdate,
  once: false,
  async execute(oldState: VoiceState, newState: VoiceState) {
    console.log(oldState, newState);

    const oldNetwork = Reflect.get(oldState, 'networking');
    const newNetwork = Reflect.get(newState, 'networking');

    oldNetwork?.off('stateChange', networkStateChangeHandler);
    newNetwork?.on('stateChange', networkStateChangeHandler);
  }
}
