'use strict';

import type { GuildMember } from 'discord.js';
import { log } from '../features/memberLogger.js';
import { storeMemberRoles } from '../features/rolePersistence.js';
import type { Event } from '../interfaces/Event';

export const event: Event = {
  name: 'guildMemberRemove',
  execute(member: GuildMember): void {
    log(member, 'left');
    storeMemberRoles(member);
  },
};
