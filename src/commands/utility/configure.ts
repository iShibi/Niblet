import { guildsInfo } from '../../index.js';
import GuildModel from '../../schemas/guild.js';
import { MessageEmbed, Permissions } from 'discord.js';
import type { Command } from '../../interfaces/Command';
import type { Message } from 'discord.js';
import type { GuildSchemaInterface } from '../../schemas/guild.js';

export const command: Command = {
  name: 'configure',
  description: 'Set basic information related to the guild',
  category: 'utility',
  usage: '--set <key> <value> OR --view',
  args: true,
  permissions: [Permissions.FLAGS.ADMINISTRATOR],
  async execute(message: Message, args: Array<string>): Promise<Message | undefined> {
    const keys = ['name', 'id', 'memberLogsChannelId', 'messageLogsChannelId'];
    if (args[0] === '--set') {
      const key = args[1];
      const value = args[2];
      if (!key || !value) return message.channel.send('Provide key/value pairs to set for the guild');
      if (!keys.includes(key)) return message.channel.send('Provide valid key');
      GuildModel.findOne({ id: message.guild?.id }, (err: Error, doc: GuildSchemaInterface) => {
        if (err) {
          console.log(err);
          return message.channel.send('There was an error');
        } else if (doc) {
          // @ts-ignore
          doc[key] = value;
          doc.save().then(savedDoc => guildsInfo.set(savedDoc.id, savedDoc));
        } else {
          const newGuildDoc = new GuildModel({
            name: message.guild?.name,
            id: message.guild?.id,
          });
          // @ts-ignore
          newGuildDoc[key] = value;
          newGuildDoc.save().then(savedDoc => guildsInfo.set(savedDoc.id, savedDoc));
        }
      });
      return message.channel.send('Guild config set');
    } else if (args[0] === '--view') {
      const guildInfo = guildsInfo.get(message.guild?.id as string);
      if (!guildInfo) return message.channel.send('Guild info not set!');
      let description = '';
      // @ts-ignore
      keys.forEach(key => (description += `${key}: ${guildInfo[key]}\n`));
      const embed = new MessageEmbed()
        .setAuthor(`${message.guild?.name}`, `${message.guild?.iconURL()}`)
        .setColor('GREEN')
        .setDescription(description);
      return message.channel.send(embed);
    }
  },
};
