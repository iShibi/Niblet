'use strict';

import type { GuildMember } from 'discord.js';
import { log } from '../features/memberLogger.js';
import { addRolesBack } from '../features/rolePersistence.js';

export const event = (member: GuildMember): void => {
  log(member, 'join');
  addRolesBack(member);
};
