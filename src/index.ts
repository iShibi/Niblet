import { Client, Collection } from 'discord.js';
import fs from 'fs';
import mongoose from 'mongoose';
import { NIBLET_ATLAS_URI, BOT_TOKEN } from './config.js';
import GuildModel from './schemas/guild.js';
import type { Command } from './interfaces/Command';
import type { Event } from './interfaces/Event';
import type { GuildSchemaInterface } from './schemas/guild.js';

mongoose
  .connect(NIBLET_ATLAS_URI as string, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.log('There was an error', err));

const client: Client = new Client();

const commands: Collection<string, Command> = new Collection();

const commandFolders: Array<string> = fs.readdirSync('./src/commands');
commandFolders.forEach(folder => {
  const commandFiles: Array<string> = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));
  commandFiles.forEach(async file => {
    const commandModule = await import(`./commands/${folder}/${file}`);
    commands.set(commandModule.command.name, commandModule.command);
  });
});

const eventFiles: Array<string> = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
eventFiles.forEach(async file => {
  const eventModule = await import(`./events/${file}`);
  const event: Event = eventModule.event;
  if (event.once) {
    client.once(event.name, (...args: Array<string>) => event.execute(...args, client, commands));
  } else {
    client.on(event.name, (...args: Array<string>) => event.execute(...args, client, commands));
  }
});

export const guildsInfo: Collection<string, GuildSchemaInterface> = new Collection();
GuildModel.find({}, (err: Error, docs: Array<GuildSchemaInterface>) => {
  if (err) {
    console.log(err);
    return;
  } else if (docs.length) {
    docs.forEach(guildDoc => guildsInfo.set(guildDoc.id, guildDoc));
  } else {
    console.log('No guild configs found. Use the configure cmd in a guild to set info about it');
  }
});

client.login(BOT_TOKEN);
