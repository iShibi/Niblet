import type { Client } from 'discord.js';

export const event = (client: Client): void => {
  console.log(`Logged in as ${client.user?.tag}`);
  client.user?.setActivity('your commands', {
    type: 'LISTENING',
  });
};
