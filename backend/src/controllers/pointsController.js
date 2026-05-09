const { query, sql } = require('../config/database');

const getAllPoints = async (req, res) => {
  try {
    const result = await query(
      `SELECT id, name, description, faction, activities, color, x_percent, y_percent, image_url, created_at
       FROM points_of_interest
       ORDER BY created_at DESC`
    );
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener puntos:', error);
    res.status(500).json({ error: 'Error al obtener puntos de interés' });
  }
};

const getPointById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(
      'SELECT id, name, description, faction, activities, color, x_percent, y_percent, image_url, created_at FROM points_of_interest WHERE id = @id',
      { id: parseInt(id) }
    );
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Punto no encontrado' });
    }
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error al obtener punto:', error);
    res.status(500).json({ error: 'Error al obtener punto de interés' });
  }
};

const VALID_COLORS = ['#ff8c00', '#ffd700', '#00ff88', '#00d4ff'];

const createPoint = async (req, res) => {
  const { name, description, faction, activities, color, x_percent, y_percent } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  if (!name || x_percent === undefined || y_percent === undefined) {
    return res.status(400).json({ error: 'Nombre y coordenadas son requeridos' });
  }

  const xVal = parseFloat(x_percent);
  const yVal = parseFloat(y_percent);
  if (isNaN(xVal) || isNaN(yVal) || xVal < 0 || xVal > 100 || yVal < 0 || yVal > 100) {
    return res.status(400).json({ error: 'Las coordenadas deben ser porcentajes entre 0 y 100' });
  }

  const colorVal = VALID_COLORS.includes(color) ? color : null;

  try {
    const result = await query(
      `INSERT INTO points_of_interest (name, description, faction, activities, color, x_percent, y_percent, image_url, created_by)
       OUTPUT INSERTED.id, INSERTED.name, INSERTED.description, INSERTED.faction, INSERTED.activities,
              INSERTED.color, INSERTED.x_percent, INSERTED.y_percent, INSERTED.image_url, INSERTED.created_at
       VALUES (@name, @description, @faction, @activities, @color, @x_percent, @y_percent, @image_url, @created_by)`,
      {
        name,
        description: description || null,
        faction: faction || null,
        activities: activities || null,
        color: colorVal,
        x_percent: xVal,
        y_percent: yVal,
        image_url,
        created_by: req.user.id,
      }
    );
    res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error('Error al crear punto:', error);
    res.status(500).json({ error: 'Error al crear punto de interés' });
  }
};

const updatePoint = async (req, res) => {
  const { id } = req.params;
  const { name, description, faction, activities, color, x_percent, y_percent } = req.body;

  try {
    const existing = await query(
      'SELECT id, image_url FROM points_of_interest WHERE id = @id',
      { id: parseInt(id) }
    );
    if (existing.recordset.length === 0) {
      return res.status(404).json({ error: 'Punto no encontrado' });
    }

    const image_url = req.file
      ? `/uploads/${req.file.filename}`
      : existing.recordset[0].image_url;

    const colorVal = VALID_COLORS.includes(color) ? color : null;

    const result = await query(
      `UPDATE points_of_interest
       SET name = @name, description = @description, faction = @faction,
           activities = @activities, color = @color, x_percent = @x_percent, y_percent = @y_percent,
           image_url = @image_url, updated_at = GETDATE()
       OUTPUT INSERTED.id, INSERTED.name, INSERTED.description, INSERTED.faction,
              INSERTED.activities, INSERTED.color, INSERTED.x_percent, INSERTED.y_percent, INSERTED.image_url
       WHERE id = @id`,
      {
        id: parseInt(id),
        name,
        description: description || null,
        faction: faction || null,
        activities: activities || null,
        color: colorVal,
        x_percent: parseFloat(x_percent),
        y_percent: parseFloat(y_percent),
        image_url,
      }
    );
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error al actualizar punto:', error);
    res.status(500).json({ error: 'Error al actualizar punto de interés' });
  }
};

const deletePoint = async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await query(
      'SELECT id FROM points_of_interest WHERE id = @id',
      { id: parseInt(id) }
    );
    if (existing.recordset.length === 0) {
      return res.status(404).json({ error: 'Punto no encontrado' });
    }

    await query('DELETE FROM points_of_interest WHERE id = @id', { id: parseInt(id) });
    res.json({ message: 'Punto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar punto:', error);
    res.status(500).json({ error: 'Error al eliminar punto de interés' });
  }
};

module.exports = { getAllPoints, getPointById, createPoint, updatePoint, deletePoint };
