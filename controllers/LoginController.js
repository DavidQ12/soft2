document.getElementById('formLogin').addEventListener('submit', function (event) {
    event.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const contrasena = document.getElementById('contrasena').value;

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioAutenticado = usuarios.find(user => user.usuario === usuario && user.contrasena === contrasena);

    if (usuarioAutenticado) {
        localStorage.setItem('usuarioAutenticado', JSON.stringify(usuarioAutenticado));
        window.location.href = 'publicaciones.html'; // Redirigir al feed o página principal
    } else {
        alert('Usuario o contraseña incorrectos');
    }
});

