export interface UserSchema {
  username: string;
  id: string;
  tag: string;
  warnings: number;
  restrictions: number;
  mutes: number;
  kicks: number;
  softbans: number;
  bans: number;
  roles: Array<string>;
}
