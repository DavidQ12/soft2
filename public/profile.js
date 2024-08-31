document.addEventListener('DOMContentLoaded', function () {
    const codigoEstudiante = window.location.pathname.split('/').pop();

    fetch(`/api/usuario/${codigoEstudiante}`)
        .then(response => response.json())
        .then(usuario => {
            document.getElementById('nombre').value = usuario.nombre;
            document.getElementById('email').value = usuario.email;
            document.getElementById('carrera').value = usuario.carrera;
            document.getElementById('carnet').value = usuario.codigo_estudiante;
            document.getElementById('descripcion').textContent = usuario.descripcion;
            document.getElementById('fotoPerfil').src = `/uploads/${usuario.foto_perfil}`;
        })
        .catch(error => {
            console.error('Error al obtener los datos del usuario:', error);
        });
});
