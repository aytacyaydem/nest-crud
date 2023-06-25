import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}
  async createBookmark(userId: number, dto: CreateBookmarkDto) {
    // Create a bookmark with prisma and return it
    const bookmark = await this.prisma.bookmark.create({
      data: {
        userId,
        ...dto,
      },
    });
    return bookmark;
  }
  async getBookmarks(userId: number) {
    const bookmarks = this.prisma.bookmark.findMany({
      where: {
        userId,
      },
    });
    return bookmarks;
  }
  async getBookmarkById(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: {
        id: bookmarkId,
        userId,
      },
    });
    return bookmark;
  }
  async editBookmark(userId: number, bookmarkId: number, dto: EditBookmarkDto) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });
    if (!bookmark) {
      throw new ForbiddenException('There is no bookmark with this id');
    }

    if (bookmark.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to edit this bookmark',
      );
    }

    const updatedBookmark = await this.prisma.bookmark.update({
      where: {
        id: bookmarkId,
      },
      data: {
        ...dto,
      },
    });

    if (!updatedBookmark) {
      throw new ForbiddenException('Unexpected error while updating bookmark');
    }

    return updatedBookmark;
  }
  async deleteBookmark(userId: number, bookmarkId: number) {
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });
    if (!bookmark) {
      throw new ForbiddenException('There is no bookmark with this id');
    }

    if (bookmark.userId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to delete this bookmark',
      );
    }

    const deletedBookmark = await this.prisma.bookmark.delete({
      where: {
        id: bookmarkId,
      },
    });

    if (!deletedBookmark) {
      throw new ForbiddenException('Unexpected error while deleting bookmark');
    }

    return bookmark;
  }
}
