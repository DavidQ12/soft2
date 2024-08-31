// controllers/UserController.js
const mysql = require('mysql2');

// Configuración de la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234567',
  database: 'uforum2'
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

    const query = 'SELECT nombre, codigo_estudiante, carrera, email, descripcion, foto_perfil FROM users WHERE codigo_estudiante = ?';
    connection.query(query, [codigoEstudiante], (err, results) => {
        if (err) {
            console.error('Error al consultar el perfil del usuario:', err);
            return res.status(500).send('Error en la consulta');
        }
        if (results.length === 0) {
            return res.status(404).send('Usuario no encontrado');
        }
        res.json(results[0]);
    });
};
