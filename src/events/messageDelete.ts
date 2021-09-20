import { logDeletedMessage } from '../features/messageLogging';
import type { Event } from '../typings';
import type { Message } from 'discord.js';

export const event: Event = {
  name: 'messageDelete',
  once: false,
  async execute(message: Message) {
    const authorId = message.author.id;
    const clientId = message.client.user?.id;
    if (authorId === clientId) return;
    logDeletedMessage(message);
  },
};
