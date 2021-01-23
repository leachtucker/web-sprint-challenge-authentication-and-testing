const request = require('supertest');
const server = require('./server');

const db = require('../data/dbConfig');

const user1 = { username: "bob", password: "1234" }

// AUTH
describe('server.js', () => {
  beforeEach(async () => {
    await db.migrate.rollback();
    await db.migrate.latest();
  })

  afterAll(async () => {
    await db.destroy();
  })

  // /auth/register
  it('should return a response of "username taken" when user is already registered', async () => {
    await request(server).post('/api/auth/register').send(user1);
    const res = await request(server).post('/api/auth/register').send(user1);

    expect(res.body).toBe("username taken")
  })

  it('should return a status code of 400 when user is already registered', async () => {
    await request(server).post('/api/auth/register').send(user1);
    const res = await request(server).post('/api/auth/register').send(user1);

    expect(res.status).toBe(400);
  })

  it('should return a body with the user object with proper input', async () => {
    const res = await request(server).post('/api/auth/register').send(user1);

    expect(res.body.id).toBe(1);
    expect(res.body.username).toBe("bob");
    expect(res.body.password).toBeTruthy();
  })

  // auth/login
  it('should return "invalid credentials" if username or password is incorrect', async () => {
    const res = await request(server).post('/api/auth/login').send(user1);

    expect(res.body).toBe("invalid credentials");
  })

  it('should return a status code of 400 if username or password is incorrect', async () => {
    const res = await request(server).post('/api/auth/login').send(user1);

    expect(res.status).toBe(400);
  })

  it('should return a response body of message and token and the users username', async () => {
    await request(server).post('/api/auth/register').send(user1);
    const res = await request(server).post('/api/auth/login').send(user1);

    expect(res.body.message).toBeTruthy();
    expect(res.body.message.includes(user1.username)).toBeTruthy();
    expect(res.body.token).toBeTruthy();
  })

  // /users and the restrict middleware
  it('should return a body with "no token"', async () => {
    const res = await request(server).get('/api/jokes');

    expect(res.body).toBe("token required");
  })

  it('should return a body with "token invalid"', async () => {
    const res = await request(server).get('/api/jokes').set('Authorization', 'token');

    expect(res.body).toBe("token invalid");
  })

  it('should return a list of jokes if proper token', async () => {
    const res1 = await request(server).post('/api/auth/register').send(user1);
    const res2 = await request(server).post('/api/auth/login').send(user1);

    const res3 = await request(server).get('/api/jokes').set('Authorization', res2.body.token);

    expect(Array.isArray(res3.body)).toBe(true);
    expect(res3.body.length).toBe(3);
  })

})