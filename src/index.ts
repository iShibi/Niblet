import type { Snowflake } from 'discord.js';
import { Client, Collection } from 'discord.js';
import fs from 'fs';
import { MongoClient } from 'mongodb';
import { NIBLET_ATLAS_URI, NIBLET_BOT_TOKEN } from './config';
import type { Event, GuildDocument, InteractionCommand } from './typings/index';

export const mongoClient = new MongoClient(NIBLET_ATLAS_URI);

try {
  await mongoClient.connect();
  console.log('Connected to MongoDB atlas');
} catch (error: unknown) {
  console.log('Error while connecting to MongoDB atlas:\n', error);
}

const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS'],
});

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
    client.once(event.name, (...args) => event.execute(...args, client, interactionCommands));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client, interactionCommands));
  }
});

export const guildDocs = new Collection<Snowflake, GuildDocument>();

client.login(NIBLET_BOT_TOKEN);
