import { Client } from 'discord.js';
import { NIBLET_ATLAS_URI, NIBLET_BOT_TOKEN } from './config';
import { connectToMongodb, setupBot } from './utils/Utility';

const client = new Client({
  intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_MEMBERS'],
});

await setupBot(client);

await connectToMongodb(NIBLET_ATLAS_URI, client);

client.login(NIBLET_BOT_TOKEN);
