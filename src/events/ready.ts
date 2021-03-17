import type { Client } from 'discord.js';
import type { Event } from '../interfaces/Event';

export const event: Event = {
  name: 'ready',
  once: true,
  execute(client: Client): void {
    console.log(`Logged in as ${client.user?.tag}`);
    client.user?.setActivity('your commands', {
      type: 'LISTENING',
    });
  },
};
