const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Middleware para manejar datos de formularios
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (js, css, imágenes, html)
app.use(express.static(path.join(__dirname, 'public')));

// Ruta de bienvenida
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'inicio.html'));
});

// Ruta de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Ruta de registro
app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'registro.html'));
});

// Manejar POST de login
app.post('/login', (req, res) => {
    // Aquí puedes agregar lógica de autenticación
    console.log('Inicio de sesión:', req.body);

    // Redirigir a la página de publicaciones
    res.redirect('/publicaciones');
});

// Manejar POST de registro
app.post('/registro', (req, res) => {
    // Aquí puedes agregar lógica para registrar al usuario
    console.log('Registro de usuario:', req.body);

    // Redirigir a la página de publicaciones
    res.redirect('/publicaciones');
});

// Otras rutas
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

app.get('/info', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'info.html'));
});

app.get('/usuario', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'usuario.html'));
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



