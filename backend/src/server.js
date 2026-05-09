const app = require('./app');
const { getPool } = require('./config/database');

const PORT = process.env.PORT || 3001;

const start = async () => {
  try {
    await getPool();
    console.log('Conexión a SQL Server establecida');
    app.listen(PORT, () => {
      console.log(`Servidor Zygerria Map corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

start();
