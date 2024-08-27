document.addEventListener('DOMContentLoaded', () => {
    const registroButton = document.getElementById('goToRegistro');
    const loginButton = document.getElementById('goToLogin');

    if (registroButton) {
        registroButton.addEventListener('click', () => {
            window.location.href = '/registro'; // Asegúrate de que esto coincida con la ruta en el servidor
        });
    } else {
        console.error('El botón de registro no se encuentra en el DOM');
    }

    if (loginButton) {
        loginButton.addEventListener('click', () => {
            window.location.href = '/login'; // Asegúrate de que esto coincida con la ruta en el servidor
        });
    } else {
        console.error('El botón de inicio de sesión no se encuentra en el DOM');
    }
});

