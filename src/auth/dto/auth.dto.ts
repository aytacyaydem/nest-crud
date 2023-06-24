import { User } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export type CreatedUser = Pick<User, 'id' | 'email' | 'createdAt'>;

export interface AuthorizedJwtPayload {
  access_token: string;
}
