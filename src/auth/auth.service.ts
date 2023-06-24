import { ForbiddenException, Injectable } from '@nestjs/common';
import { User, Bookmark } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto, AuthorizedJwtPayload, CreatedUser } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signup(dto: AuthDto): Promise<AuthorizedJwtPayload> {
    try {
      const hash = await argon.hash(dto.password);

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: hash,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });

      return this.signToken(user.id, user.email);
    } catch (error) {
      console.log({ error: error.meta.target });
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Email already exists');
        }
        throw new Error('Unexpected error');
      }
    }
  }
  async signin(dto: AuthDto): Promise<AuthorizedJwtPayload> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if (!user) {
        throw new ForbiddenException('Email or password is incorrect');
      }

      const isPasswordCorrect = await argon.verify(user.hash, dto.password);

      if (isPasswordCorrect) {
        return this.signToken(user.id, user.email);
      }

      throw new ForbiddenException('Email or password is incorrect');
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new Error('Unexpected error');
    }
  }
  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = { sub: userId, email };
    const secret = this.config.get<string>('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      secret,
      expiresIn: '15m',
    });
    return {
      access_token: token,
    };
  }
}
