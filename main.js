require('dotenv').config(); // Cargar variables de entorno
const express = require('express');
const path = require('path');
const multer = require('multer');
const mysql = require('mysql2');
const bcrypt = require('bcrypt'); // para cifrar y comparar contraseñas
const http = require('http'); // Importar http para socket.io
const socketIo = require('socket.io'); // Importar socket.io
const nodemailer = require('nodemailer'); // Importar Nodemailer
const crypto = require('crypto'); // Para generar tokens de recuperación
const app = express();
const port = process.env.PORT || 3000; // Usar puerto desde variables de entorno

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
      return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
    }

    const user = results[0];

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error en el servidor' });
      }

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
      }

      // Contraseña coincide, enviar éxito
      res.status(200).json({ success: true, usuario: user });
    });
  });
});

app.post('/registro', upload.single('foto'), (req, res) => {
  const { nombre, email, password, carrera, codigo_estudiante, descripcion } = req.body;
  const foto_perfil = req.file ? req.file.filename : null;

  // Cifrar la contraseña antes de guardarla
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).send('Error en el servidor');
    }

    const query = `INSERT INTO users (nombre, codigo_estudiante, carrera, email, password, descripcion, foto_perfil)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const values = [nombre, codigo_estudiante, carrera, email, hash, descripcion, foto_perfil];

    connection.query(query, values, (err, results) => {
      if (err) {
        return res.status(500).send('Error al registrar el usuario');
      }
      res.redirect('/publicaciones');
    });
  });
});

// Rutas para los perfiles de usuario
app.get('/usuario/:codigo_estudiante', UserController.getProfile);

// Ruta para obtener la lista de chats (no usada)
app.get('/api/chats', (req, res) => {
  res.json({ message: 'Ruta para obtener la lista de chats no implementada' });
});

// Ruta para obtener detalles de un chat (no usada)
app.get('/api/chats/:id', (req, res) => {
  res.json({ message: 'Ruta para obtener detalles de un chat no implementada' });
});

// Ruta para obtener mensajes entre dos usuarios
app.get('/api/chats/:user1_id/:user2_id', (req, res) => {
  const user1_id = parseInt(req.params.user1_id, 10); // Convertir a entero
  const user2_id = parseInt(req.params.user2_id, 10); // Convertir a entero

  if (isNaN(user1_id) || isNaN(user2_id)) {
    return res.status(400).json({ success: false, message: 'ID de usuario inválido' });
  }

  const query = `SELECT * FROM private_messages
                 WHERE (emisor_id = ? AND receptor_id = ?) OR (emisor_id = ? AND receptor_id = ?)
                 ORDER BY fecha_envio`;
  connection.query(query, [user1_id, user2_id, user2_id, user1_id], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al obtener mensajes', error: err });
    }
    res.json(results);
  });
});

// Ruta para enviar un mensaje en un chat
app.post('/api/chats/:user1_id/:user2_id/messages', upload.single('image'), (req, res) => {
  const user1_id = parseInt(req.params.user1_id, 10); // Convertir a entero
  const user2_id = parseInt(req.params.user2_id, 10); // Convertir a entero
  const { contenido } = req.body;
  const urlImagen = req.file ? req.file.filename : null;

  if (isNaN(user1_id) || isNaN(user2_id)) {
    return res.status(400).json({ success: false, message: 'ID de usuario inválido' });
  }

  const query = `INSERT INTO private_messages (emisor_id, receptor_id, contenido, url_imagen)
                 VALUES (?, ?, ?, ?)`;
  const values = [user1_id, user2_id, contenido, urlImagen];

  connection.query(query, values, (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error al enviar el mensaje', error: err });
    }
    res.json({
      contenido,
      url_imagen: urlImagen ? `/uploads/${urlImagen}` : null,
      fecha_envio: new Date(),
      emisor_id: user1_id
    });
  });
});

// Rutas para servir páginas HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'inicio.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/registro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'registro.html'));
});

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

// Crear servidor HTTP y configurar socket.io
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('Un usuario se ha conectado');

  // Escuchar mensajes de chat
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg); // Enviar el mensaje a todos los clientes conectados
  });

  socket.on('joinChat', (data) => {
    socket.join(data.chatId); // Unir el socket a un canal de chat específico
  });

  socket.on('disconnect', () => {
    console.log('Un usuario se ha desconectado');
  });
});

// Ruta para recuperación de contraseña
app.post('/recuperar', (req, res) => {
  const { email } = req.body;

  const query = 'SELECT * FROM users WHERE email = ?';
  connection.query(query, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Error en el servidor' });
    }

    if (results.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Generar un token de recuperación
    const token = crypto.randomBytes(20).toString('hex');

    // Configuración del transportador de Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Configurar el correo electrónico
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Recuperación de contraseña',
      text: `Haz clic en el siguiente enlace para restablecer tu contraseña: http://localhost:${port}/reset/${token}`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Error al enviar el correo' });
      }
      res.json({ success: true, message: 'Correo de recuperación enviado', info });
    });
  });
});

// Iniciar servidor
server.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
