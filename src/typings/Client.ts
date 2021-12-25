import type { PrismaClient } from '@prisma/client';
import type { InteractionCommand } from './Interaction';
import type { Collection, Snowflake } from 'discord.js';

declare module 'discord.js' {
  interface Client {
    commands: Collection<Snowflake, InteractionCommand>;
    prisma: PrismaClient;
  }
}
