require('./setup');
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/database', () => ({
  query: jest.fn(),
  sql: {},
  getPool: jest.fn(),
  closePool: jest.fn(),
}));

const { query } = require('../src/config/database');
const app = require('../src/app');

const validToken = jwt.sign(
  { id: 1, username: 'starwarsrol' },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);

const mockPoint = {
  id: 1,
  name: 'Palacio de la Reina',
  description: 'Sede del poder zygerriano',
  faction: 'Imperio Esclavista Zygerriano',
  activities: 'Negociaciones, subastas',
  x_percent: 48.5,
  y_percent: 32.0,
  image_url: null,
  created_at: new Date().toISOString(),
};

describe('Points Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/points', () => {
    it('debe devolver lista de puntos sin autenticación', async () => {
      query.mockResolvedValueOnce({ recordset: [mockPoint] });
      const res = await request(app).get('/api/points');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Palacio de la Reina');
    });

    it('debe devolver lista vacía si no hay puntos', async () => {
      query.mockResolvedValueOnce({ recordset: [] });
      const res = await request(app).get('/api/points');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('debe devolver 500 si hay error de base de datos', async () => {
      query.mockRejectedValueOnce(new Error('DB error'));
      const res = await request(app).get('/api/points');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/points/:id', () => {
    it('debe devolver un punto por id', async () => {
      query.mockResolvedValueOnce({ recordset: [mockPoint] });
      const res = await request(app).get('/api/points/1');
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
    });

    it('debe devolver 404 si el punto no existe', async () => {
      query.mockResolvedValueOnce({ recordset: [] });
      const res = await request(app).get('/api/points/999');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Punto no encontrado');
    });
  });

  describe('POST /api/points', () => {
    it('debe rechazar creación sin autenticación', async () => {
      const res = await request(app)
        .post('/api/points')
        .send({ name: 'Nuevo Punto', x_percent: 50, y_percent: 50 });
      expect(res.status).toBe(401);
    });

    it('debe rechazar creación sin nombre', async () => {
      const res = await request(app)
        .post('/api/points')
        .set('Authorization', `Bearer ${validToken}`)
        .field('x_percent', '50')
        .field('y_percent', '50');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('requeridos');
    });

    it('debe rechazar coordenadas fuera de rango', async () => {
      const res = await request(app)
        .post('/api/points')
        .set('Authorization', `Bearer ${validToken}`)
        .field('name', 'Punto Inválido')
        .field('x_percent', '150')
        .field('y_percent', '50');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('porcentajes');
    });

    it('debe crear punto con datos válidos', async () => {
      query.mockResolvedValueOnce({ recordset: [mockPoint] });
      const res = await request(app)
        .post('/api/points')
        .set('Authorization', `Bearer ${validToken}`)
        .field('name', 'Palacio de la Reina')
        .field('description', 'Sede del poder')
        .field('faction', 'Imperio Esclavista')
        .field('activities', 'Negociaciones')
        .field('x_percent', '48.5')
        .field('y_percent', '32.0');
      expect(res.status).toBe(201);
    });
  });

  describe('PUT /api/points/:id', () => {
    it('debe rechazar actualización sin autenticación', async () => {
      const res = await request(app)
        .put('/api/points/1')
        .send({ name: 'Actualizado' });
      expect(res.status).toBe(401);
    });

    it('debe devolver 404 si el punto no existe', async () => {
      query.mockResolvedValueOnce({ recordset: [] });
      const res = await request(app)
        .put('/api/points/999')
        .set('Authorization', `Bearer ${validToken}`)
        .field('name', 'No existe')
        .field('x_percent', '50')
        .field('y_percent', '50');
      expect(res.status).toBe(404);
    });

    it('debe actualizar punto con autenticación válida', async () => {
      const updated = { ...mockPoint, name: 'Nombre Actualizado' };
      query.mockResolvedValueOnce({ recordset: [{ id: 1, image_url: null }] });
      query.mockResolvedValueOnce({ recordset: [updated] });
      const res = await request(app)
        .put('/api/points/1')
        .set('Authorization', `Bearer ${validToken}`)
        .field('name', 'Nombre Actualizado')
        .field('x_percent', '48.5')
        .field('y_percent', '32.0');
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/points/:id', () => {
    it('debe rechazar eliminación sin autenticación', async () => {
      const res = await request(app).delete('/api/points/1');
      expect(res.status).toBe(401);
    });

    it('debe devolver 404 si el punto no existe', async () => {
      query.mockResolvedValueOnce({ recordset: [] });
      const res = await request(app)
        .delete('/api/points/999')
        .set('Authorization', `Bearer ${validToken}`);
      expect(res.status).toBe(404);
    });

    it('debe eliminar punto con autenticación válida', async () => {
      query.mockResolvedValueOnce({ recordset: [{ id: 1 }] });
      query.mockResolvedValueOnce({ recordset: [] });
      const res = await request(app)
        .delete('/api/points/1')
        .set('Authorization', `Bearer ${validToken}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Punto eliminado correctamente');
    });
  });
});
