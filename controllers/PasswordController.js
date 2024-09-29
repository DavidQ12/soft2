import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { promisify } from 'util'; // Para convertir la función de crypto en promesas
import mysql from 'mysql2/promise';
import dotenv from 'dotenv'; // Para variables de entorno
import bcrypt from 'bcrypt'; // Para encriptar la nueva contraseña

dotenv.config(); // Cargar variables del archivo .env

// Configura el pool de conexiones de MySQL
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// Configura el transporte de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail', // O cualquier otro servicio como SendGrid, SMTP
    auth: {
        user: process.env.EMAIL_USER, // Email del archivo .env
        pass: process.env.EMAIL_PASS // Contraseña del email desde el .env
    }
});

// Función para generar tokens seguros
const randomBytesAsync = promisify(crypto.randomBytes);

// Controlador para enviar el enlace de recuperación
export const enviarCorreoRecuperacion = async (req, res) => {
    const { email } = req.body;

    try {
        // Verificar si el email existe en la base de datos
        const [result] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (result.length === 0) {
            return res.status(404).json({ message: 'Este correo no está registrado.' });
        }

        // Generar un token de recuperación
        const token = (await randomBytesAsync(20)).toString('hex');
        const tokenExpire = Date.now() + 3600000; // 1 hora de validez

        // Guardar el token en la base de datos
        await db.execute(
            'UPDATE users SET resetPasswordToken = ?, resetPasswordExpire = ? WHERE email = ?',
            [token, tokenExpire, email]
        );

        // Crear enlace de recuperación
        const resetURL = `http://${req.headers.host}/reset/${token}`;

        // Configurar correo electrónico
        const mailOptions = {
            from: 'no-reply@uforum.com',
            to: email,
            subject: 'Recuperación de contraseña',
            text: `Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para restablecerla: \n\n${resetURL}\n\nSi no solicitaste esto, simplemente ignora este correo.`
        };

        // Enviar el correo
        await transporter.sendMail(mailOptions);

        res.json({ message: 'Correo de recuperación enviado. Revisa tu bandeja de entrada.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Hubo un error al enviar el correo de recuperación.' });
    }
};
