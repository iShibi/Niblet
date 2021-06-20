import fs from 'fs';
import mongoose from 'mongoose';
import { Client, Collection } from 'discord.js';
import { BOT_TOKEN, NIBLET_ATLAS_URI } from './config.js';
import type { Snowflake } from 'discord.js';
import type { Event, GuildDocument, InteractionCommand } from './interfaces/index';

const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES'],
});

mongoose
  .connect(NIBLET_ATLAS_URI as string, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.log('There was an error:\n', err));

const interactionCommands = new Collection<string, InteractionCommand>();

const commandFolders = fs.readdirSync('./src/commands');
commandFolders.forEach(folder => {
  const interactionCommandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));
  interactionCommandFiles.forEach(async file => {
    const interactionCommand: InteractionCommand = (await import(`./commands/${folder}/${file}`)).interactionCommand;
    interactionCommands.set(interactionCommand.data.name, interactionCommand);
  });
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

export const guildDocs = new Collection<Snowflake, GuildDocument>();

client.login(BOT_TOKEN);
