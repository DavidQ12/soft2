app.post('/login', (req, res) => {
    const { usuario, password } = req.body;
  
    console.log('Datos recibidos:', req.body);  // Verifica qué se recibe
  
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
  




