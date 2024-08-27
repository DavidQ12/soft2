document.getElementById('formRegistro').addEventListener('submit', function (event) {
    event.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const foto = document.getElementById('foto').value;
    const carnet = document.getElementById('carnet').value;
    const carrera = document.getElementById('carrera').value;
    const usuario = document.getElementById('usuario').value;
    const contrasena = document.getElementById('contrasena').value;

    // Validar la ruta de la imagen
    if (!foto.startsWith('images/')) {
        alert('La ruta de la imagen debe comenzar con "images/"');
        return;
    }

    // Guardar datos en localStorage
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const nuevoUsuario = {
        nombre,
        foto,
        carnet,
        carrera,
        usuario,
        contrasena
    };

    usuarios.push(nuevoUsuario);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    // Redirigir al login
    window.location.href = 'login.html';
});

