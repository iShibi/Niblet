import { initGuildDoc } from '../utils/Utility';
import type { Guild } from 'discord.js';
import type { Event } from '../typings';

export const event: Event = {
  name: 'guildCreate',
  once: false,
  async execute(guild: Guild) {
    const guildDocExist = await guild.client.prisma.guild.findUnique({
      where: {
        id: guild.id,
      },
    });

    if (!guildDocExist) {
      await initGuildDoc(guild);
    }
  },
};
