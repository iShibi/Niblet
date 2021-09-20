import { logEditedMessage } from '../features/messageLogging';
import type { Event } from '../typings';
import type { Message } from 'discord.js';

export const event: Event = {
  name: 'messageUpdate',
  once: false,
  async execute(oldMessage: Message, newMessage: Message) {
    const authorId = oldMessage.author.id ?? newMessage.author.id;
    const clientId = oldMessage.client.user?.id ?? newMessage.client.user?.id;
    if (oldMessage.content === newMessage.content || authorId === clientId) return;
    logEditedMessage(oldMessage, newMessage);
  },
};
