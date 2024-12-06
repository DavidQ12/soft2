// Inicializar publicaciones con datos predeterminados 
if (!localStorage.getItem('publicaciones')) {
    const publicacionesIniciales = [
        {
            'titulo': 'Publicación de David Ernesto Quintanilla Segovia',
            'contenido': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
            'nombre': 'David Ernesto Quintanilla Segovia',
            'carnet': 'SMSS152722',
            'carrera': 'Ingeniería en Sistemas y Redes',
            'foto': 'images/David_foto.jpeg' 
        },
        {
            'titulo': 'Publicación de Luis Francisco Pleitez Quintanilla',
            'contenido': 'Proin ac mauris non sem faucibus ultrices...',
            'nombre': 'Luis Francisco Pleitez Quintanilla',
            'carnet': 'SMSS073122',
            'carrera': 'Ingeniería en Sistemas',
            'foto': 'images/pleitez_foto.jpg' 
        },
        {
            'titulo': 'Publicación de Patrick Jeremi Orellana Menjívar',
            'contenido': 'Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere...',
            'nombre': 'Patrick Jeremi Orellana Menjívar',
            'carnet': 'SMSS108822',
            'carrera': 'Ingeniería en Sistemas',
            'foto': 'images/patrick_foto.jpg' 
        }
    ];
    localStorage.setItem('publicaciones', JSON.stringify(publicacionesIniciales));
}

// Simulamos usuarios registrados
const usuariosRegistrados = [
    { nombre: 'David Ernesto Quintanilla Segovia', codigo_estudiante: 'SMSS152722', id: 1 },
    { nombre: 'Luis Francisco Pleitez Quintanilla', codigo_estudiante: 'SMSS073122', id: 2 },
    { nombre: 'Patrick Jeremi Orellana Menjívar', codigo_estudiante: 'SMSS108822', id: 3 }
];

// Función para detectar menciones en el contenido
function procesarEtiquetas(contenido) {
    const regex = /@([A-Za-z0-9]+)/g; // Detecta el "@" seguido de cualquier código de estudiante
    let contenidoModificado = contenido;
    let match;

    while ((match = regex.exec(contenido)) !== null) {
        const codigoEstudiante = match[1];
        const usuario = usuariosRegistrados.find(user => user.codigo_estudiante === codigoEstudiante);

        if (usuario) {
            const perfilLink = `<a href="usuario.html?id=${usuario.id}">@${usuario.codigo_estudiante}</a>`;
            contenidoModificado = contenidoModificado.replace(`@${codigoEstudiante}`, perfilLink);
        }
    }
    return contenidoModificado;
}

function obtenerPublicaciones() {
    return JSON.parse(localStorage.getItem('publicaciones')) || [];
}

function guardarPublicaciones(publicaciones) {
    localStorage.setItem('publicaciones', JSON.stringify(publicaciones));
}

function obtenerUsuarioAutenticado() {
    return JSON.parse(localStorage.getItem('usuarioAutenticado')) || null;
}

function crearPublicacion(titulo, contenido) {
    const publicaciones = obtenerPublicaciones();
    const usuarioAutenticado = obtenerUsuarioAutenticado();

    if (!usuarioAutenticado) {
        console.error('No hay usuario autenticado.');
        return;
    }

    // Procesar las etiquetas antes de guardar el contenido
    const contenidoConEtiquetas = procesarEtiquetas(contenido);

    const nuevaPublicacion = {
        titulo,
        contenido: contenidoConEtiquetas, // Guardamos el contenido con las etiquetas procesadas
        nombre: usuarioAutenticado.nombre,
        carnet: usuarioAutenticado.carnet,
        carrera: usuarioAutenticado.carrera,
        foto: usuarioAutenticado.foto // Usar la foto del usuario autenticado
    };

    publicaciones.unshift(nuevaPublicacion); // Añadir al principio del array
    guardarPublicaciones(publicaciones);
}

// Mostrar publicaciones en la página
function mostrarPublicaciones() {
    const contenedorPublicaciones = document.getElementById('contenedorPublicaciones');
    contenedorPublicaciones.innerHTML = '';

    const publicaciones = obtenerPublicaciones();

    publicaciones.forEach((publicacion, index) => {
        const publicacionHTML = `
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title">${publicacion.titulo}</h5>
                    <p class="card-text">${publicacion.contenido}</p>
                    <div class="d-flex align-items-center mb-3">
                        <img src="${publicacion.foto}" alt="Foto de perfil" class="rounded-circle" style="width: 50px; height: 50px; margin-right: 10px;">
                        <div>
                            <strong>${publicacion.nombre}</strong><br>
                            <small class="text-muted">Carnet: ${publicacion.carnet}</small><br>
                            <small class="text-muted">Carrera: ${publicacion.carrera}</small>
                        </div>
                    </div>
                    <a href="publicacion_detalle.html?id=${index}" class="btn btn-outline-primary">Ver más</a>
                </div>
            </div>
        `;
        contenedorPublicaciones.innerHTML += publicacionHTML;
    });
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    mostrarPublicaciones();

    // Manejar el envío del formulario para crear una nueva publicación
    document.getElementById('formPublicacion').addEventListener('submit', function (event) {
        event.preventDefault();

        const titulo = document.getElementById('titulo').value;
        const contenido = document.getElementById('contenido').value;

        // Obtener la foto del usuario autenticado para la nueva publicación
        const usuarioAutenticado = obtenerUsuarioAutenticado();
        const foto = usuarioAutenticado ? usuarioAutenticado.foto : 'images/default.jpg';

        crearPublicacion(titulo, contenido, foto);

        // Mostrar mensaje de éxito
        document.getElementById('mensajeExito').style.display = 'block';

        // Limpiar formulario
        document.getElementById('formPublicacion').reset();
    });

   // Cerrar sesión
   document.getElementById('logout').addEventListener('click', function () {
    localStorage.removeItem('usuarioAutenticado'); // Opcional, para limpiar la sesión
    window.location.href = 'inicio.html'; 
});
});