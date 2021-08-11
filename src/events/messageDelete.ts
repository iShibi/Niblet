import { logDeletedMessage } from '../features/messageLog';
import type { Message } from 'discord.js';
import type { Event } from '../typings/index';

export const event: Event = {
  name: 'messageDelete',
  async execute(message: Message) {
    const authorID = message.author.id;
    const clientID = message.client.user?.id;
    if (authorID === clientID) return;
    logDeletedMessage(message);
  },
};
