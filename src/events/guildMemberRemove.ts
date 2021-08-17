import type { GuildMember } from 'discord.js';
import { logMember } from '../features/memberLogging';
import { storeMemberRoles } from '../features/rolePersistence';
import type { Event } from '../typings';

export const event: Event = {
  name: 'guildMemberRemove',
  once: false,
  async execute(member: GuildMember) {
    logMember(member, 'REMOVE');
    storeMemberRoles(member);
  },
};
