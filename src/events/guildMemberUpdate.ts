import type { Event } from '../typings';
import type { GuildMember } from 'discord.js';
import { addMemberRoles } from '../features/rolePersistence';

export const event: Event = {
  name: 'guildMemberUpdate',
  once: false,
  async execute(oldMember: GuildMember, newMember: GuildMember) {
    if (oldMember.pending && !newMember.pending) {
      addMemberRoles(newMember);
    }
  },
};
