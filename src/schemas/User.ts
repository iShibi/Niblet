import mongoose from 'mongoose';
import type { UserSchema } from '../interfaces/index';

const userSchema: mongoose.Schema = new mongoose.Schema({
  username: String,
  id: String,
  tag: String,
  warnings: { type: Number, default: 0 },
  restrictions: { type: Number, default: 0 },
  mutes: { type: Number, default: 0 },
  kicks: { type: Number, default: 0 },
  softbans: { type: Number, default: 0 },
  bans: { type: Number, default: 0 },
  roles: { type: Array },
});

export const UserModel = mongoose.model<UserSchema>('user', userSchema);
