import fs from 'fs';
import Prisma from '@prisma/client';
import type { Event, InteractionCommand } from '../typings';
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

/**
 * Connects the bot to a mongodb atlas database
 * @param client client The instance of {@link Client} in use
 */
export async function connectToMongodb(client: Client): Promise<void> {
  try {
    const { PrismaClient } = Prisma;
    client.prisma = new PrismaClient();
    await client.prisma.$connect();
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
  const userDoc = await client.prisma.user.findFirst({
    where: {
      id: user.id,
      guildId: guild.id,
    },
  });
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
 * Collects a button interaction on a message that passes the given filter.
 * @param message The message to create the collector on
 * @param filter The function for filtering component interactions
 * @param collectorDuration The time for which the collector should be active
 * @returns An array containing collected interaction and error, only one of them can be non-null at a time
 */
export async function collectButtonInteraction(
  message: Message,
  filter: (i: MessageComponentInteraction) => boolean,
  collectorDuration?: number,
): Promise<[MessageComponentInteraction | null, unknown | null]> {
  try {
    const response = await message.awaitMessageComponent({ filter, componentType: 'BUTTON', time: collectorDuration });
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
  const createdGuildApplicationCommands = await guild.commands.set(commandData);
  const fullPermissions: Array<GuildApplicationCommandPermissionData> = [];
  for (const [id, command] of createdGuildApplicationCommands) {
    fullPermissions.push({
      id,
      permissions: await buildPermissionData(guild, command.id),
    });
  }
  await guild.commands.permissions.set({ fullPermissions });
  return createdGuildApplicationCommands;
}

export async function buildPermissionData(
  guild: Guild,
  commandId: Snowflake,
): Promise<Array<ApplicationCommandPermissionData>> {
  const data: Array<ApplicationCommandPermissionData> = [
    {
      id: guild.ownerId,
      type: 'USER',
      permission: true,
    },
  ];
  const guildDoc = await guild.client.prisma.guild.findUnique({
    where: {
      id: guild.id,
    },
    include: {
      applicationCommands: {
        include: {
          permissions: true,
        },
      },
    },
  });
  if (!guildDoc) {
    await initGuildDoc(guild);
    return data;
  }
  const commandPermissions = guildDoc.applicationCommands.find(cmd => cmd.id === commandId)?.permissions;
  if (!commandPermissions) return data;
  for (const { id, type, permission } of commandPermissions) {
    data.push({ id, type: type === 'ROLE' ? 'ROLE' : 'USER', permission });
  }
  return data;
}

export async function initGuildDoc(guild: Guild): Promise<Prisma.Guild> {
  return await guild.client.prisma.guild.create({
    data: {
      id: guild.id,
      name: guild.name,
    },
  });
}
