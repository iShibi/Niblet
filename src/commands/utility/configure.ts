import { guildsInfo } from '../../index.js';
import GuildModel from '../../schemas/guild.js';
import type { Command } from '../../interfaces/Command';
import type { Message, TextChannel } from 'discord.js';

export const command: Command = {
  name: 'configure',
  description: 'Set basic information related to the guild',
  category: 'utility',
  async execute(message: Message, args: Array<string>): Promise<Message | undefined> {
    if (args[0] === 'set') {
      const newGuildDoc = new GuildModel({
        name: message.guild?.name,
        id: message.guild?.id,
      });
      newGuildDoc.save().then(savedDoc => guildsInfo.set(savedDoc.id, savedDoc));
      return message.channel.send('Guild config set');
    } else if (args[0] === 'view') {
      const guildInfo = guildsInfo.get(message.guild?.id as string);
      if (!guildInfo) return message.channel.send('Guild info not set!');
      return message.channel.send(`${guildInfo}`);
    }
  },
};
