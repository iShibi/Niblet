import type { Client } from 'discord.js';
import type { Event } from '../typings';

export const event: Event = {
  name: 'ready',
  once: true,
  async execute(client: Client): Promise<void> {
    console.log(`Logged in as ${client.user?.tag}`);
    client.user?.setActivity('your commands', {
      type: 'LISTENING',
    });
  },
};
