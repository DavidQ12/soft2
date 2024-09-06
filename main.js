const express = require('express');
const path = require('path');
const multer = require('multer');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');  // para cifrar y comparar contraseñas
const app = express();
const port = 3000;

// Controladores
const UserController = require('./controllers/UserController');

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

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

// Middleware para manejar datos de formularios
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Servir archivos estáticos (js, css, imágenes, html)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta de login para API
app.post('/login', (req, res) => {
  const { usuario, password } = req.body;

  // Consulta para encontrar al usuario por su email o código de estudiante
  const query = 'SELECT * FROM users WHERE email = ? OR codigo_estudiante = ?';
  connection.query(query, [usuario, usuario], (err, results) => {
    if (err) {
      console.error('Error al consultar el usuario:', err);
      return res.status(500).json({ success: false, message: 'Error en el servidor' });
    }

    if (results.length === 0) {
      console.log('Usuario no encontrado:', usuario);
      return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }

    const user = results[0];

    console.log('Usuario encontrado:', user);

    // Comparar la contraseña proporcionada con la almacenada en la base de datos
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error al comparar las contraseñas:', err);
        return res.status(500).json({ success: false, message: 'Error en el servidor' });
      }

      console.log('¿Contraseña coincide?', isMatch);

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
      }

      // Si la contraseña coincide, enviar una respuesta de éxito con la información del usuario
      res.status(200).json({ success: true, usuario: user });
    });
  });
});

app.post('/registro', upload.single('foto'), (req, res) => {
  console.log('Registro de usuario:', req.body);

  const { nombre, email, password, carrera, codigo_estudiante, descripcion } = req.body;
  const foto_perfil = req.file ? req.file.filename : null;

  // Cifrar la contraseña antes de guardarla
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Error al cifrar la contraseña:', err);
      return res.status(500).send('Error en el servidor');
    }

    const query = `
      INSERT INTO users (nombre, codigo_estudiante, carrera, email, password, descripcion, foto_perfil)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [nombre, codigo_estudiante, carrera, email, hash, descripcion, foto_perfil];

    connection.query(query, values, (err, results) => {
      if (err) {
        console.error('Error al insertar el usuario:', err);
        return res.status(500).send('Error al registrar el usuario');
      }
      console.log('Usuario registrado con éxito');
      res.redirect('/publicaciones');
    });
  });
});

// Rutas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'inicio.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'registro.html'));
});

// Ruta para obtener el perfil del usuario
app.get('/usuario/:codigo_estudiante', UserController.getProfile);

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

app.get('/info', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'info.html'));
});

app.get('/publicaciones', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'publicaciones.html'));
});

app.get('/publicaciones/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'publicacion_detalle.html'));
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});




















