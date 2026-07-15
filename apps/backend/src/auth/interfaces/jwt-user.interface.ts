import { Role } from '../../../generated/prisma/enums';

export interface JwtUser {
  id: string;
  email: string;
  role: Role;
}