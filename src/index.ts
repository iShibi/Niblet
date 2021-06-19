import fs from 'fs';
import { Client } from 'discord.js';
import { BOT_TOKEN } from './config.js';
import type { Event } from './interfaces/Event';

const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES'],
});

const eventFiles: Array<string> = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));

eventFiles.forEach(async file => {
  const event: Event = (await import(`./events/${file}`)).event;
  if (event.once) {
    client.once(event.name, (...args: Array<string>) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args: Array<string>) => event.execute(...args, client));
  }
});

client.login(BOT_TOKEN);
