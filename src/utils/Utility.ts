import fs from 'fs';
import { MongoClient } from 'mongodb';
import {
  ApplicationCommand,
  ApplicationCommandPermissionData,
  Client,
  Collection,
  Guild,
  GuildApplicationCommandPermissionData,
  Message,
  MessageComponentInteraction,
  MessageEmbed,
  Snowflake,
  User,
} from 'discord.js';
import type { Event, GuildDocument, InteractionCommand, UserDocument } from '../typings';

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
): Promise<[MessageComponentInteraction | null, unknown | null]> {
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

/**
 * Deploys slash commands in a guild.
 * @param guild The guild to deploy slash commands in
 * @returns A {@link Collection} of {@link ApplicationCommand} objects as a `Promise`
 */
export async function deployGuildSlashCommads(guild: Guild): Promise<Collection<Snowflake, ApplicationCommand>> {
  const client = guild.client;
  const commandData = client.commands.map(command => command.data);
  const createdSlashCommands = await guild.commands.set(commandData);
  const fullPermissions: Array<GuildApplicationCommandPermissionData> = [];
  for (const [id, slashCmd] of createdSlashCommands) {
    const cmd = client.commands.find(cmd => cmd.data.name === slashCmd.name);
    if (!cmd) continue;
    fullPermissions.push({
      id: id,
      permissions: await buildPermissionData(guild, slashCmd.name),
    });
  }
  await guild.commands.permissions.set({ fullPermissions });
  return createdSlashCommands;
}

export async function buildPermissionData(
  guild: Guild,
  cmdName: string,
): Promise<Array<ApplicationCommandPermissionData>> {
  const data: Array<ApplicationCommandPermissionData> = [
    {
      id: guild.ownerId,
      type: 'USER',
      permission: true,
    },
  ];
  const guildDoc = await guild.client.mongoDb.collection<GuildDocument>('guilds').findOne({ id: guild.id });
  const slashCmdPermissions = guildDoc?.slashCommands?.find(cmd => cmd.name === cmdName)?.permissions;
  if (!slashCmdPermissions) return data;
  for (const perm of slashCmdPermissions) {
    data.push({
      id: perm.id,
      type: perm.type,
      permission: perm.permission,
    });
  }
  return data;
}
