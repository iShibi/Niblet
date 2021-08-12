import { Client, Collection, Message, MessageComponentInteraction, MessageEmbed, Snowflake, User } from 'discord.js';
import fs from 'fs';
import { MongoClient } from 'mongodb';
import type { Event, GuildDocument, InteractionCommand, UserDocument } from '../typings';

/**
 * Sets the bot up by loading commands, registering events, and initializing extended client properties
 * @param client The instance of {@link Client} in use
 */
export async function setupBot(client: Client): Promise<void> {
  loadCommands(client);
  registerEvents(client);
  client.guildDocs = new Collection();
}

/**
 * Connects the bot to a mongodb atlas database
 * @param uri The uri of the databse to connect to
 * @param client client The instance of {@link Client} in use
 */
export async function connectToMongodb(uri: string, client: Client): Promise<void> {
  try {
    const databaseName = /\w\/([^?]*)/g.exec(uri)?.[1];
    client.mongoDb = (await MongoClient.connect(uri)).db(databaseName);
    console.log('Connected to MongoDB atlas');
  } catch (error: unknown) {
    console.log('Error while connecting to MongoDB atlas:\n', error);
  }
}

/**
 * Creates an embed containing information about a user's history
 * @returns An embed containing history of the provided user
 */
export function createUserHistoryEmbed(user: User, data?: UserDocument): MessageEmbed {
  const userHistoryEmbed = new MessageEmbed()
    .setAuthor(`${user.tag} (${user.id}) ${data ? '✔️' : '❌'}`, user.displayAvatarURL())
    .setColor('RED')
    .setFooter(
      // eslint-disable-next-line
      `warnings: ${data?.warnings ?? 0}, restrictions: ${data?.restrictions ?? 0}, mutes: ${data?.mutes ?? 0}, kicks: ${data?.kicks ?? 0
      }, softbans: ${data?.softbans ?? 0}, bans: ${data?.bans ?? 0}`,
    );

  return userHistoryEmbed;
}

/**
 * Fetches document of a guild from database or from cache if present
 * @returns A guild document
 */
export async function fetchGuildDoc(
  guildID: Snowflake,
  client: Client,
  force?: boolean,
): Promise<GuildDocument | undefined> {
  if (!force) {
    const guildDoc = client.guildDocs.get(guildID);
    if (guildDoc) return guildDoc;
  }
  const guildDoc = await client.mongoDb.collection<GuildDocument>('guilds').findOne({ id: guildID });
  return guildDoc;
}

/**
 * A function that abstracts try/catch block for component interaction collector into a monad
 * @param message Message to create component interaction collector on
 * @param filter The function for filtering component interactions
 * @param collectorTime The time for which the collector should be active
 * @returns An array containing collected item and error, only one of them can be non-null at a time
 */
export async function collectMessageComponentInteraction(
  message: Message,
  filter: (collectedComponentInteraction: MessageComponentInteraction) => boolean,
  collectorTime?: number,
): Promise<[MessageComponentInteraction | null, Error | null]> {
  try {
    const response = await message.awaitMessageComponent({ filter, componentType: 'BUTTON', time: collectorTime });
    return [response, null];
  } catch (error) {
    return [null, error];
  }
}

/**
 * Loads all the interaction commands from commands folder into the memory
 * @param client The instance of {@link Client} in use
 */
export async function loadCommands(client: Client): Promise<void> {
  client.commands = new Collection();
  const commandFolders = fs.readdirSync('./src/commands');
  for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./src/commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
      const command: InteractionCommand = (await import(`../commands/${folder}/${file}`)).interactionCommand;
      client.commands.set(command.data.name, command);
    }
  }
}

/**
 * Registers all the events in the events folder
 * @param client The instance of {@link Client} in use
 */
export async function registerEvents(client: Client): Promise<void> {
  const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
  for (const file of eventFiles) {
    const event: Event = (await import(`../events/${file}`)).event;
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
}
