import { logDeletedMessage } from '../features/deletedMessageLogger.js';
import type { Message } from 'discord.js';
import type { Event } from '../interfaces/Event';

export const event: Event = {
  name: 'messageDelete',
  execute(message: Message): void {
    logDeletedMessage(message);
  },
};
