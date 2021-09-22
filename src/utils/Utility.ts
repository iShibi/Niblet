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
} from 'discord.js';
import type { Event, GuildDocument, ApplicationCommandDocument, InteractionCommand, UserDocument } from '../typings';

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
 * Creates an embed containing information about a user's history in a given guild
 * @param userId The id of the user whose history embed is to be created
 * @param guild The guild to look into for the user's history
 * @returns An embed containing history of the provided user in the given guild
 */
export async function createUserHistoryEmbed(userId: Snowflake, guild: Guild): Promise<MessageEmbed> {
  const { client } = guild;
  const user = await client.users.fetch(userId);
  const userDoc = await client.mongoDb.collection<UserDocument>('users').findOne({ id: user.id, guildId: guild.id });
  const userHistoryEmbed = new MessageEmbed()
    .setAuthor(`${user.tag} (${user.id}) ${userDoc ? '✔️' : '❌'}`, user.displayAvatarURL())
    .setColor('RED')
    .setFooter(
      // eslint-disable-next-line
      `warnings: ${userDoc?.warnings ?? 0}, restrictions: ${userDoc?.restrictions ?? 0}, mutes: ${userDoc?.mutes ?? 0}, kicks: ${userDoc?.kicks ?? 0
      }, softbans: ${userDoc?.softbans ?? 0}, bans: ${userDoc?.bans ?? 0}`,
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
 * Deploys application commands in a guild.
 * @param guild The guild to deploy commands in
 * @returns A {@link Collection} of {@link ApplicationCommand} objects as a `Promise`
 */
export async function deployGuildApplicationCommads(guild: Guild): Promise<Collection<Snowflake, ApplicationCommand>> {
  const client = guild.client;
  const commandData = client.commands.map(command => command.data);
  const createdApplicationCommands = await guild.commands.set(commandData);
  const fullPermissions: Array<GuildApplicationCommandPermissionData> = [];
  for (const [id, command] of createdApplicationCommands) {
    const cmd = client.commands.find(cmd => cmd.data.name === command.name);
    if (!cmd) continue;
    fullPermissions.push({
      id: id,
      permissions: await buildPermissionData(guild, command.name),
    });
  }
  await guild.commands.permissions.set({ fullPermissions });
  await syncGuildApplicationCommandData(guild, createdApplicationCommands);
  return createdApplicationCommands;
}

export async function buildPermissionData(
  guild: Guild,
  commandName: string,
): Promise<Array<ApplicationCommandPermissionData>> {
  const data: Array<ApplicationCommandPermissionData> = [
    {
      id: guild.ownerId,
      type: 'USER',
      permission: true,
    },
  ];
  const guildDoc = await guild.client.mongoDb.collection<GuildDocument>('guilds').findOne({ id: guild.id });
  if (!guildDoc) {
    await initGuildDatabase(guild);
    return data;
  }
  const commandPermissions = guildDoc.applicationCommands?.find(cmd => cmd.name === commandName)?.permissions;
  if (!commandPermissions) return data;
  for (const { id, type, permission } of commandPermissions) {
    data.push({ id, type, permission });
  }
  return data;
}

export async function syncGuildApplicationCommandData(
  guild: Guild,
  commands: Collection<string, ApplicationCommand>,
): Promise<void> {
  const guildDoc = await guild.client.mongoDb.collection<GuildDocument>('guilds').findOne({ id: guild.id });

  const oldGuildApplicationCommandNames = guildDoc?.applicationCommands.map(cmd => cmd.name);
  const currentGuildApplicationCommandNames = commands.map(cmd => cmd.name);

  const newGuildApplicationCommands = commands.filter(cmd => !oldGuildApplicationCommandNames?.includes(cmd.name));
  const newGuildApplicationCommandDataArray = newGuildApplicationCommands.map(cmd => {
    const newGuildApplicationCommandData: ApplicationCommandDocument = {
      name: cmd.name,
      permissions: [],
    };
    return newGuildApplicationCommandData;
  });

  const newGuildDoc = await guild.client.mongoDb
    .collection<GuildDocument>('guilds')
    .findOneAndUpdate(
      { id: guild.id },
      { $push: { applicationCommands: { $each: newGuildApplicationCommandDataArray } } },
      { returnDocument: 'after' },
    );

  const currentGuildApplicationCommandDataArrary = newGuildDoc.value?.applicationCommands.filter(cmd =>
    currentGuildApplicationCommandNames.includes(cmd.name),
  );

  await guild.client.mongoDb
    .collection<GuildDocument>('guilds')
    .findOneAndUpdate({ id: guild.id }, { $set: { applicationCommands: currentGuildApplicationCommandDataArrary } });
}

export async function initGuildDatabase(guild: Guild): Promise<void> {
  const guildDoc: GuildDocument = {
    id: guild.id,
    name: guild.name,
    applicationCommands: guild.client.commands.map(cmd => {
      const applicationCommandDoc: ApplicationCommandDocument = {
        name: cmd.data.name,
        permissions: [],
      };
      return applicationCommandDoc;
    }),
  };

  await guild.client.mongoDb.collection<GuildDocument>('guilds').insertOne(guildDoc);
}
