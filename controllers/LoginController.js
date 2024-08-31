document.getElementById('formLogin').addEventListener('submit', function (event) {
    event.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const contrasena = document.getElementById('contrasena').value;

    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identificador: usuario, password: contrasena })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.setItem('usuarioAutenticado', JSON.stringify(data.usuario));
            window.location.href = 'publicaciones.html'; // Redirigir al feed o página principal
        } else {
            alert('Usuario o contraseña incorrectos');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});



