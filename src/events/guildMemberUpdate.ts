import type { GuildMember } from 'discord.js';
import { addMemberRoles } from '../features/rolePersistence';
import type { Event } from '../typings';

export const event: Event = {
  name: 'guildMemberUpdate',
  once: false,
  async execute(oldMember: GuildMember, newMember: GuildMember) {
    if (oldMember.pending && !newMember.pending) {
      addMemberRoles(newMember);
    }
  },
};
