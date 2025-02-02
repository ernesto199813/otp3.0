const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();

// Vercel espera exportar la app y no usar `listen`
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'intranetd6@gmail.com',
    pass: 'bicd dpvg gcwy ihyc' // Sustituir con tu contraseña de aplicación
  }
});

let otps = {}; // Almacenar OTPs generados temporalmente en un objeto

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Ruta para enviar OTP
app.post('/send-otp', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send('Email is required');
  }

  const otp = generateOtp(); // Generar OTP aquí
  otps[email] = otp; // Almacenar OTP en el objeto temporal
  console.log(`Generated OTP: ${otp}`); // Asegúrate de que se genera y se imprime el OTP

  const mailOptions = {
    from: 'intranetd6@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).send({ otp }); // Enviar OTP generado al cliente para verificación (solo para pruebas)
    }
  });
});

// Ruta para verificar OTP
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) { // Corrección aquí
    return res.status(400).send('Email and OTP are required');
  }

  if (otps[email] && otps[email] === otp) {
    delete otps[email]; // Eliminar OTP después de la verificación
    res.status(200).send('OTP verified successfully');
  } else {
    res.status(400).send('Invalid OTP');
  }
});

// Exportamos la aplicación para Vercel
module.exports = app;
