import { Event } from '../interfaces/index.js';
import { logMember } from '../features/memberLog.js';
import type { GuildMember } from 'discord.js';

export const event: Event = {
  name: 'guildMemberRemove',
  once: false,
  async execute(member: GuildMember): Promise<void> {
    logMember(member, 'REMOVE');
  },
};
