import { Client } from 'discord.js';
import { connectToMongodb, loadCommands, registerEvents } from './utils/Utility';
import { NIBLET_ATLAS_URI, NIBLET_BOT_TOKEN } from './config';

const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS'],
});

await loadCommands(client);

await registerEvents(client);

await connectToMongodb(NIBLET_ATLAS_URI, client);

client.login(NIBLET_BOT_TOKEN);
