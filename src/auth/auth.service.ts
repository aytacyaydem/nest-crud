import { ForbiddenException, Injectable } from '@nestjs/common';
import { User, Bookmark } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto, CreatedUser } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable({})
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signup(dto: AuthDto): Promise<CreatedUser> {
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

      return user;
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
  async signin(dto: AuthDto): Promise<CreatedUser> {
    // Find the user with email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // If no user, throw error
    if (!user) {
      throw new ForbiddenException('Email or password is incorrect');
    }
    // If user, compare password
    const isPasswordCorrect = await argon.verify(user.hash, dto.password);

    // If password is correct, return user
    if (isPasswordCorrect) {
      return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      };
    }

    // If password is incorrect, throw error
    throw new ForbiddenException('Email or password is incorrect');
  }
}
