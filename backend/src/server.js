const app = require('./app');
const { getPool } = require('./config/database');

const PORT = process.env.PORT || 3001;

const start = async () => {
  try {
    await getPool();
    const dbType = process.env.DB_TYPE === 'sqlite' ? 'SQLite' : 'SQL Server';
    console.log(`Conexión a ${dbType} establecida`);
    app.listen(PORT, () => {
      console.log(`Servidor Zygerria Map corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

start();
