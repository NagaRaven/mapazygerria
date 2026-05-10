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
        { name: 'La Jaula Dorada', description: null, faction: 'Casa Seraptis', activities: null, color: '#00ff88', x_percent: 76.85995623632385, y_percent: 30.510293238499624 },
        { name: 'Coliseo de Zygerria', description: null, faction: 'Reino de Zygerria', activities: null, color: '#00ff88', x_percent: 48.14004376367615, y_percent: 12.55729110780692 },
        { name: 'Palacio de la Reina Neferi', description: null, faction: 'Reino de Zygerria', activities: null, color: '#00ff88', x_percent: 48.413566739606125, y_percent: 34.33634287290955 },
        { name: 'La Gran Pirámide', description: null, faction: 'Reino de Zygerria', activities: null, color: '#00ff88', x_percent: 48.19474835886214, y_percent: 56.40970614835139 },
        { name: 'Catedral del Sol Negro', description: null, faction: 'Iglesia del Sol Negro', activities: null, color: '#00ff88', x_percent: 79.70459518599561, y_percent: 56.9002253322501 },
        { name: 'Palacio de Seraptis', description: null, faction: 'Casa Seraptis', activities: null, color: '#00d4ff', x_percent: 60.0656455142232, y_percent: 26.586139767309962 },
        { name: 'Palacio de Nabila', description: null, faction: 'Casa Nabila', activities: null, color: '#00d4ff', x_percent: 69.42013129102844, y_percent: 49.24812606343026 },
        { name: 'Palacio de Syntha', description: null, faction: 'Casa Syntha', activities: null, color: '#00d4ff', x_percent: 59.901531728665205, y_percent: 75.63805815718074 },
        { name: 'Palacio de Dinar', description: null, faction: 'Casa Dinar', activities: null, color: '#00d4ff', x_percent: 33.69803063457331, y_percent: 72.0082161963303 },
        { name: 'Palacio de Rakshi', description: null, faction: 'Casa Rakshi', activities: null, color: '#00d4ff', x_percent: 35.44857768052516, y_percent: 26.6842436040897 },
        { name: 'Palacio de Thuul', description: null, faction: 'Casa Thuul', activities: null, color: '#00d4ff', x_percent: 26.148796498905906, y_percent: 49.640541410549226 },
        { name: 'Xalithra', description: null, faction: 'Casa Dinar', activities: null, color: '#ff8c00', x_percent: 32.713347921225385, y_percent: 74.55891595260358 },
        { name: 'Kelten', description: null, faction: 'Casa Dinar', activities: null, color: null, x_percent: 35.120350109409195, y_percent: 75.63805815718074 },
        { name: 'Slay', description: null, faction: 'Casa Syntha', activities: null, color: '#ff8c00', x_percent: 58.97155361050328, y_percent: 77.40392721921609 },
        { name: 'Armería', description: null, faction: 'Casa Rakshi', activities: null, color: '#00ff88', x_percent: 26.96936542669584, y_percent: 20.503701886965985 },
        { name: 'Viñedos', description: null, faction: 'Casa Dinar', activities: null, color: '#00ff88', x_percent: 26.312910284463896, y_percent: 85.4484418351549 },
        { name: 'Mercado', description: null, faction: 'Casa Nabila', activities: null, color: '#00ff88', x_percent: 74.50765864332604, y_percent: 74.65701978938333 },
        { name: 'El Foso', description: null, faction: 'Reino de Zygerria', activities: null, color: '#00ff88', x_percent: 48.85120350109409, y_percent: 75.73616199396048 },
        { name: 'Centros de investigación', description: null, faction: 'Casa Syntha', activities: null, color: '#00ff88', x_percent: 58.096280087527354, y_percent: 86.72379171329153 },
        { name: 'Minas de Virana', description: null, faction: 'Casa Virana', activities: null, color: '#00d4ff', x_percent: 15.153172866520787, y_percent: 64.84663611140917 },
        { name: 'Fortín de los Krysen', description: null, faction: 'Casa Krysen', activities: null, color: null, x_percent: 73.52297592997812, y_percent: 85.93896101905361 },
        { name: 'Sastrería de moda', description: null, faction: 'Casa Sayid', activities: null, color: '#00ff88', x_percent: 28.227571115973742, y_percent: 15.990925395097873 },
        { name: 'Residencia Sayid', description: null, faction: 'Casa Sayid', activities: null, color: '#00d4ff', x_percent: 29.48577680525164, y_percent: 12.55729110780692 },
        { name: 'Residencia de Ferronix', description: null, faction: 'Casa Ferronix', activities: null, color: '#00d4ff', x_percent: 17.61487964989059, y_percent: 29.333047197142726 },
        { name: 'Parque del Arrabal', description: null, faction: 'Reino de Zygerria', activities: null, color: '#00ff88', x_percent: 23.249452954048138, y_percent: 23.250609316798748 },
        { name: 'Circo de Ameth', description: null, faction: 'Casa Ameth', activities: null, color: '#00d4ff', x_percent: 67.06783369803063, y_percent: 21.38663641798366 },
        { name: 'Cuartel de la Capital', description: null, faction: 'Reino de Zygerria', activities: null, color: '#00ff88', x_percent: 34.68271334792122, y_percent: 41.203611447491454 },
        { name: 'Joyería', description: null, faction: 'Casa Shanek', activities: null, color: '#00ff88', x_percent: 66.41137855579868, y_percent: 14.519367843401751 },
        { name: 'Retransmisiones Zygerria', description: null, faction: 'Casa Shanek', activities: null, color: '#00d4ff', x_percent: 82.98687089715536, y_percent: 40.32067691647378 },
        { name: 'Oferta mercantil: telas', description: 'La casa de Nabila advierte que, durante muy poco tiempo, será bastante asequible la adquisición de telas en grandes cantidades.', faction: 'Casa Nabila', activities: 'Recursos', color: '#ffd700', x_percent: 73.63238512035011, y_percent: 71.5176970124316 },
        { name: 'Envío masivo de hierro', description: 'La casa Ferronix está preparando un gran envío de hierro al otro lado de la ciudad. Ha pagado por mercenarios para evitar imprevistos.', faction: 'Casa Ferronix', activities: 'Recursos', color: '#ffd700', x_percent: 18.49015317286652, y_percent: 34.43444670968929 },
        { name: '¡Se buscan entrevistados!', description: 'Mayan Shanek, de Retransmisiones Zygerria, busca un antiguo participante de un Umbral para dar espectáculo a su programa.', faction: 'Casa Shanek', activities: 'Influencia', color: '#ffd700', x_percent: 84.57330415754923, y_percent: 37.96618483375998 },
        { name: 'Programa Dieciocho', description: 'La casa Syntha busca a alguien con capacidad y permiso de su dueño para acceder al misterioso programa Dieciocho. Asegura un pago acorde.', faction: 'Casa Syntha', activities: 'Dinero', color: '#ffd700', x_percent: 61.816192560175054, y_percent: 78.28686175023375 },
        { name: 'Asesino', description: 'Un asesino de esclavos anda suelto por el sur. La guardia de los Thuul ha puesto un precio por su cabeza.', faction: 'Casa Thuul', activities: null, color: '#ffd700', x_percent: 23.522975929978116, y_percent: 72.0082161963303 },
        { name: 'Arenas clandestinas', description: 'La excampeona Kensa de nuevo está en las calles del barrio oeste buscando candidatos para sus juegos privados. Se dice que paga bien.', faction: 'Reino de Zygerria', activities: 'Dinero', color: '#ffd700', x_percent: 14.934354485776804, y_percent: 43.361895856645766 },
        { name: 'Una mano obediente', description: 'La Iglesia del Sol Negro y sus zelotes buscan a alguien capaz de realizar una misión sagrada para con ellos. Parece que tiene que ver con los terroristas de la Luna Blanca', faction: 'Iglesia del Sol Negro', activities: 'Influencia', color: '#ffd700', x_percent: 77.73522975929978, y_percent: 58.17557521038674 },
        { name: 'Latrocinio del mercado', description: 'Están robando suministros tales como cuerdas, palas, herramientas y sacos. La Casa Virana ofrece un pago por la captura del malhechor.', faction: 'Casa Nabila', activities: 'Dinero', color: '#ffd700', x_percent: 77.13347921225383, y_percent: 72.10632003311005 },
        { name: 'Nivare', description: null, faction: 'Casa Rakshi', activities: null, color: '#ff8c00', x_percent: 75.98468271334792, y_percent: 31.49133160629704 },
      ];

      for (const p of samplePoints) {
        await query(
          `INSERT INTO points_of_interest (name, description, faction, activities, color, x_percent, y_percent, created_by)
           VALUES (@name, @description, @faction, @activities, @color, @x_percent, @y_percent, @created_by)`,
          { name: p.name, description: p.description, faction: p.faction, activities: p.activities, color: p.color, x_percent: p.x_percent, y_percent: p.y_percent, created_by: userId }
        );
      }
      console.log(`✓ ${samplePoints.length} puntos de interés restaurados`);
    } else {
      console.log('✓ Los puntos de interés ya existen, no se modifica nada');
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
