require('dotenv').config(); // Cargar variables de entorno desde el archivo .env
const mysql = require('mysql2');

// Configuración de la base de datos usando variables de entorno
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err.stack);
    return;
  }
  console.log('Conectado a la base de datos como id ' + connection.threadId);
});

exports.getProfile = (req, res) => {
    const codigoEstudiante = req.params.codigo_estudiante;

    if (!codigoEstudiante) {
        return res.status(400).json({ error: 'Código de estudiante no proporcionado' });
    }

    const query = 'SELECT nombre, codigo_estudiante, carrera, email, descripcion, foto_perfil FROM users WHERE codigo_estudiante = ?';
    connection.query(query, [codigoEstudiante], (err, results) => {
        if (err) {
            console.error('Error al consultar el perfil del usuario:', err);
            return res.status(500).json({ error: 'Error en la consulta' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json(results[0]);
    });
};
 





