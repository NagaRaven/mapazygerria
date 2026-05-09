require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');

async function seed() {
  const { query } = require('../config/database');

  console.log(`Modo base de datos: ${process.env.DB_TYPE || 'mssql'}`);

  try {
    const existingUser = await query(
      'SELECT id FROM users WHERE username = @username',
      { username: 'starwarsrol' }
    );

    if (existingUser.recordset.length === 0) {
      const passwordHash = await bcrypt.hash('starwarsrol', 10);
      await query(
        'INSERT INTO users (username, password_hash) VALUES (@username, @password_hash)',
        { username: 'starwarsrol', password_hash: passwordHash }
      );
      console.log('✓ Usuario starwarsrol creado');
    } else {
      console.log('✓ Usuario starwarsrol ya existe');
    }

    const userResult = await query(
      'SELECT id FROM users WHERE username = @username',
      { username: 'starwarsrol' }
    );
    const userId = userResult.recordset[0].id;

    const existingPoints = await query('SELECT COUNT(*) as count FROM points_of_interest', {});
    const count = existingPoints.recordset[0].count;

    if (count === 0) {
      const samplePoints = [
        {
          name: 'Palacio del Reino',
          description: 'Sede del poder central del Reino de Zygerria. Sus salones albergan los consejos de las grandes casas y las decisiones que marcan el destino de la ciudad.',
          faction: 'Reino de Zygerria',
          activities: 'Audiencias reales, Negociaciones diplomáticas, Consejos de casas',
          x_percent: 48.5,
          y_percent: 32.0,
        },
        {
          name: 'Puerto de la Alta Ciudad',
          description: 'Principal acceso a los distritos elevados. Controlado por la Alta Ciudad, regula el tránsito entre los niveles superiores e inferiores de Zygerria.',
          faction: 'Alta Ciudad',
          activities: 'Comercio, Tránsito entre niveles, Negociaciones',
          x_percent: 72.0,
          y_percent: 58.5,
        },
        {
          name: 'Templo del Sol Negro',
          description: 'Lugar sagrado de la Iglesia del Sol Negro. Sus ritos secretos atraen a devotos y curiosos por igual, aunque pocos conocen la verdad de sus doctrinas.',
          faction: 'Iglesia del Sol Negro',
          activities: 'Ritos religiosos, Reuniones secretas, Peregrinaciones',
          x_percent: 35.0,
          y_percent: 55.0,
        },
      ];

      for (const p of samplePoints) {
        await query(
          `INSERT INTO points_of_interest (name, description, faction, activities, x_percent, y_percent, created_by)
           VALUES (@name, @description, @faction, @activities, @x_percent, @y_percent, @created_by)`,
          { name: p.name, description: p.description, faction: p.faction, activities: p.activities, x_percent: p.x_percent, y_percent: p.y_percent, created_by: userId }
        );
      }
      console.log(`✓ ${samplePoints.length} puntos de interés de ejemplo creados`);
    } else {
      console.log('✓ Los puntos de interés ya existen');
    }

    console.log('\n✅ Seed completado correctamente');
    console.log('   Usuario: starwarsrol');
    console.log('   Contraseña: starwarsrol');
  } catch (error) {
    console.error('❌ Error en seed:', error.message);
    process.exit(1);
  }
}

seed();
