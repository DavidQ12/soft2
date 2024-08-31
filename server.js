const express = require('express');
const app = express();
const mysql = require('mysql2'); // Usa mysql2
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1234567',
  database: 'Uforum2'
});

// Conectar a la base de datos
connection.connect((err) => {
  if (err) {
    console.error('Error de conexión a la base de datos: ' + err.stack);
    return;
  }
  console.log('Conectado a la base de datos MySQL');
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración para manejar archivos
const upload = multer({ dest: 'uploads/' });

// Ruta para registro
app.post('/api/registro', upload.single('foto'), (req, res) => {
  const { nombre, email, password, carrera, carnet, descripcion } = req.body;
  const foto = req.file ? req.file.filename : null;
  
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al cifrar la contraseña' });
    }

    const sql = 'INSERT INTO usuarios (nombre, email, password, carrera, carnet, descripcion, foto) VALUES (?, ?, ?, ?, ?, ?, ?)';
    connection.query(sql, [nombre, email, hashedPassword, carrera, carnet, descripcion, foto], (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al registrar el usuario' });
      }
      res.json({ success: true });
    });
  });
});

// Ruta para login
app.post('/api/login', (req, res) => {
  const { identificador, password } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE email = ? OR nombre = ?';
  connection.query(sql, [identificador, identificador], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al verificar el usuario' });
    }

    if (results.length === 0) {
      return res.json({ success: false });
    }

    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al comparar contraseñas' });
      }

      if (isMatch) {
        res.json({ success: true, usuario: user });
      } else {
        res.json({ success: false });
      }
    });
  });
});

// Ruta para obtener publicaciones
app.get('/api/posts', (req, res) => {
  connection.query('SELECT * FROM posts', (err, results) => {
    if (err) {
      return res.status(500).send('Error al obtener publicaciones');
    }
    res.json(results);
  });
});

// Ruta para obtener el perfil del usuario
app.get('/api/usuario/:codigo_estudiante', (req, res) => {
  const { codigo_estudiante } = req.params;

  const sql = 'SELECT * FROM usuarios WHERE carnet = ?';
  connection.query(sql, [codigo_estudiante], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al obtener el perfil' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    res.json(results[0]);
  });
});

// Más rutas según sea necesario...

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});





