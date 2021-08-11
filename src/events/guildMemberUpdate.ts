import { addMemberRoles } from '../features/rolePersistence';
import type { GuildMember } from 'discord.js';
import type { Event } from '../typings/index';

export const event: Event = {
  name: 'guildMemberUpdate',
  once: false,
  async execute(oldMember: GuildMember, newMember: GuildMember) {
    if (oldMember.pending && !newMember.pending) {
      addMemberRoles(newMember);
    }
  },
};
