import { logDeletedMessage } from '../features/messageLog.js';
import type { Message } from 'discord.js';
import type { Event } from '../interfaces/index.js';

export const event: Event = {
  name: 'messageDelete',
  async execute(message: Message) {
    const authorID = message.author.id;
    const clientID = message.client.user?.id;
    if (authorID === clientID) return;
    logDeletedMessage(message);
  },
};
