import { Client } from 'discord.js';
import { NIBLET_BOT_TOKEN } from './config';
import { connectToMongodb, loadCommands, registerEvents } from './utils/Utility';

const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS'],
});

await loadCommands(client);

await registerEvents(client);

await connectToMongodb(client);

client.login(NIBLET_BOT_TOKEN);
