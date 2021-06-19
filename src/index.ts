import fs from 'fs';
import { Client, Collection } from 'discord.js';
import { BOT_TOKEN } from './config.js';
import type { Event } from './interfaces/Event';
import type { InteractionCommand } from './interfaces/index';

const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES'],
});

const interactionCommands = new Collection<string, InteractionCommand>();
const interactionCommandFiles: Array<string> = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
interactionCommandFiles.forEach(async file => {
  const interactionCommand: InteractionCommand = (await import(`./commands/${file}`)).interactionCommand;
  interactionCommands.set(interactionCommand.data.name, interactionCommand);
});

const eventFiles: Array<string> = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
eventFiles.forEach(async file => {
  const event: Event = (await import(`./events/${file}`)).event;
  if (event.once) {
    client.once(event.name, (...args: Array<string>) => event.execute(...args, client, interactionCommands));
  } else {
    client.on(event.name, (...args: Array<string>) => event.execute(...args, client, interactionCommands));
  }
});

client.login(BOT_TOKEN);
