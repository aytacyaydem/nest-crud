import { Test } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3009);
    prisma = app.get<PrismaService>(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3009');
  });
  afterAll(async () => {
    await app.close();
  });
  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'aytac@patika.dev',
      password: '123456789',
    };
    describe('Signup', () => {
      // Should return 400 if email is empty
      it('Should return 400 if email is empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      // Should return 400 if password is empty
      it('Should return 400 if password is empty', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      // Should return 400 if email is invalid
      it('Should return 400 if email is invalid', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: 'aytac',
            password: dto.password,
          })
          .expectStatus(400);
      });
      // Should return 400 if password and email are empty
      it('Should return 400 if password and email are empty', async () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      // Should signup correctly
      it('Should signup', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe('Signin', () => {
      it('Should return 400 if email is empty', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      // Should return 400 if password is empty
      it('Should return 400 if password is empty', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      // Should return 400 if email is invalid
      it('Should return 400 if email is invalid', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: 'aytac',
            password: dto.password,
          })
          .expectStatus(400);
      });
      // Should return 400 if password and email are empty
      it('Should return 400 if password and email are empty', async () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });
      it('Should signin', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userToken', 'access_token');
      });
    });
  });
  describe('User', () => {
    describe('Get me', () => {
      // should get current user data if token is valid
      it('Should get current user data if token is valid', async () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            // Its special syntax for get variables from pactum store
            Authorization: `Bearer $S{userToken}`,
          })
          .expectStatus(200);
      });
    });
    // describe('Edit user', () => {});
  });
  // describe('Bookmarks', () => {
  //   describe('Create bookmark', () => {});
  //   describe('Get bookmarks', () => {});
  //   describe('Get bookmark by id', () => {});
  //   describe('Edit bookmark', () => {});
  //   describe('Delete bookmark', () => {});
  // });
});
