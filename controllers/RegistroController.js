document.getElementById('formRegistro').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(document.getElementById('formRegistro'));

    fetch('/api/registro', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            window.location.href = 'login.html';
        } else {
            alert('Error al registrar el usuario');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});


