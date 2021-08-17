import type { Message } from 'discord.js';
import { logDeletedMessage } from '../features/messageLogging';
import type { Event } from '../typings';

export const event: Event = {
  name: 'messageDelete',
  async execute(message: Message) {
    const authorID = message.author.id;
    const clientID = message.client.user?.id;
    if (authorID === clientID) return;
    logDeletedMessage(message);
  },
};
