require('./setup');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  sql: {},
  getPool: jest.fn(),
  closePool: jest.fn(),
}));

const { query } = require('../src/config/database');
const app = require('../src/app');

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/login', () => {
    it('debe devolver 400 si faltan credenciales', async () => {
      const res = await request(app).post('/api/auth/login').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('debe devolver 400 si falta la contraseña', async () => {
      const res = await request(app).post('/api/auth/login').send({ username: 'starwarsrol' });
      expect(res.status).toBe(400);
    });

    it('debe devolver 401 si el usuario no existe', async () => {
      query.mockResolvedValueOnce({ recordset: [] });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'noexiste', password: 'cualquiera' });
      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Credenciales inválidas');
    });

    it('debe devolver 401 si la contraseña es incorrecta', async () => {
      const hash = await bcrypt.hash('correcta', 10);
      query.mockResolvedValueOnce({
        recordset: [{ id: 1, username: 'starwarsrol', password_hash: hash }],
      });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'starwarsrol', password: 'incorrecta' });
      expect(res.status).toBe(401);
    });

    it('debe devolver token JWT con credenciales correctas', async () => {
      const hash = await bcrypt.hash('starwarsrol', 10);
      query.mockResolvedValueOnce({
        recordset: [{ id: 1, username: 'starwarsrol', password_hash: hash }],
      });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'starwarsrol', password: 'starwarsrol' });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.username).toBe('starwarsrol');
    });

    it('el token JWT debe contener el username correcto', async () => {
      const hash = await bcrypt.hash('starwarsrol', 10);
      query.mockResolvedValueOnce({
        recordset: [{ id: 1, username: 'starwarsrol', password_hash: hash }],
      });
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'starwarsrol', password: 'starwarsrol' });

      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(decoded.username).toBe('starwarsrol');
      expect(decoded.id).toBe(1);
    });

    it('debe devolver 500 si hay un error de base de datos', async () => {
      query.mockRejectedValueOnce(new Error('DB connection error'));
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'starwarsrol', password: 'starwarsrol' });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/auth/verify', () => {
    it('debe devolver 401 sin token', async () => {
      const res = await request(app).get('/api/auth/verify');
      expect(res.status).toBe(401);
    });

    it('debe devolver 401 con token inválido', async () => {
      const res = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', 'Bearer token_invalido');
      expect(res.status).toBe(401);
    });

    it('debe devolver 200 con token válido', async () => {
      const token = jwt.sign(
        { id: 1, username: 'starwarsrol' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      const res = await request(app)
        .get('/api/auth/verify')
        .set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
      expect(res.body.username).toBe('starwarsrol');
    });
  });
});

describe('Auth Middleware', () => {
  it('debe rechazar petición sin cabecera Authorization', async () => {
    const res = await request(app).get('/api/auth/verify');
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token de acceso requerido');
  });

  it('debe rechazar token con formato incorrecto', async () => {
    const res = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', 'token_sin_bearer');
    expect(res.status).toBe(401);
  });

  it('debe rechazar token expirado', async () => {
    const expiredToken = jwt.sign(
      { id: 1, username: 'starwarsrol' },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' }
    );
    const res = await request(app)
      .get('/api/auth/verify')
      .set('Authorization', `Bearer ${expiredToken}`);
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Token inválido o expirado');
  });
});
