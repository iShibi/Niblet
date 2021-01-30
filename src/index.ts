import { Client, Collection } from 'discord.js';
import type { Message } from 'discord.js';
import fs from 'fs';

const client: Client = new Client();

const commands = new Collection();

export interface Command {
  name: string;
  execute(message: Message, args: Array<string>): Promise<void> | void;
}

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
  const eventName = file.slice(0, -3);
  client.on(eventName, (...args: Array<string>) => eventModule.event(...args, client, commands));
});

client.login(process.env.BOT_TOKEN);
