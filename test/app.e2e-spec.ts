import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let createdUser1Response;
  let createdUser2Response;
  let loginUser1;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    createdUser1Response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'carboncio@b.com',
        password: '1234',
        amount: 4,
      });
    createdUser2Response = await request(app.getHttpServer())
      .post('/auth/signup')
      .send({
        email: 'carboncio@c.com',
        password: '1234',
        amount: 4,
      });
  });

  describe('Auth Module', () => {
    describe('(POST) /auth/signup', () => {
      it('should create the user succesfully', () => {
        return request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            email: 'carboncio@a.com',
            password: '1234',
            amount: 4,
          })
          .expect('Content-Type', /application\/json/)
          .expect(201);
      });

      it('should not create the user due to not email', () => {
        return request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            email: 'carboncio.com',
            password: '1234',
            amount: 4,
          })
          .expect(400);
      });
      it('should not create the user due to amount', () => {
        return request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            email: 'carboncio.@ecom',
            password: '1234',
            amount: -4,
          })
          .expect(400);
      });
      it('should not create the user due to repeated email', () => {
        return request(app.getHttpServer())
          .post('/auth/signup')
          .send({
            email: 'carboncio.@vcom',
            password: '1234',
            amount: 4,
          })
          .expect(400);
      });
    });
    describe('(POST) /auth/signin', () => {
      it('Should signin succesfully', () => {
        return request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            email: 'carboncio@b.com',
            password: '1234',
          })
          .expect(200);
      });
      it('Should not signin due to incorrect password', () => {
        return request(app.getHttpServer())
          .post('/auth/signin')
          .send({
            email: 'carboncio@b.com',
            password: '12345',
          })
          .expect(403);
      });
    });
  });

  describe('Users Module', () => {
    beforeEach(async () => {
      loginUser1 = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'carboncio@c.com',
          password: '1234',
        });
    });
    it('(GET) /users/money/ should return the user money', async () => {
      const token1 = loginUser1._body.acces_token;
      const response = await request(app.getHttpServer())
        .get(`/users/money/`)
        .set('Authorization', `Bearer ${token1}`)
        .expect(200);
      expect(response.body).toHaveProperty('balance');
      expect(response.body.balance).toBeDefined();
    });
    it('(GET) /users/money/ should not return the user money', async () => {
      return await request(app.getHttpServer())
        .get('/users/money/')
        .expect(401);
    });
    it('(PATCH) /users/money/ should transfer money', async () => {
      const token1 = loginUser1._body.acces_token;
      const idUser2 = createdUser2Response._body.id;
      const amount = 2;
      const response = await request(app.getHttpServer())
        .patch(`/users/money/`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          amount,
          receiverId: idUser2,
        })
        .expect(200);
      expect(response.body).toHaveProperty('sender');
    });
    it('(PATCH) /users/money/ should not transfer money due to insufficient funds', async () => {
      const token1 = loginUser1._body.acces_token;
      const idUser2 = createdUser2Response._body.id;
      return await request(app.getHttpServer())
        .patch(`/users/money/`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          amount: 5,
          receiverId: idUser2,
        })
        .expect(400);
    });
    it('(PATCH) /users/money/ should not transfer money due to inexistent receiverId', async () => {
      const token1 = loginUser1._body.acces_token;
      return await request(app.getHttpServer())
        .patch(`/users/money/`)
        .set('Authorization', `Bearer ${token1}`)
        .send({
          amount: 5,
          receiverId: 'any',
        })
        .expect(400);
    });
    it('(PATCH) /users/money/ should not transfer money due to not authentication', async () => {
      const idUser2 = createdUser2Response._body.id;
      return await request(app.getHttpServer())
        .patch(`/users/money/`)
        .set('Authorization', `Bearer any`)
        .send({
          amount: 5,
          receiverId: idUser2,
        })
        .expect(401);
    });
  });

  describe('Transactions Module', () => {
    beforeEach(async () => {
      loginUser1 = await request(app.getHttpServer())
        .post('/auth/signin')
        .send({
          email: 'carboncio@c.com',
          password: '1234',
        });
    });
    it('(GET) users/:userId/Transactions, should return a list of transactions', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${createdUser1Response.body.id}/transactions`)
        .set('Authorization', `Bearer ${loginUser1._body.acces_token}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array); // Expecting an array of transactions
      expect(response.body[0]).toHaveProperty('id');
    });
  });
});
