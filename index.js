const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(express.json()); // Para leer JSON en requests
app.use(cors());

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Debes tener esta variable configurada en Render
    pass: process.env.EMAIL_PASS  // Debes tener esta variable configurada en Render
  }
});

let otps = {};

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Ruta para enviar OTP
app.post('/api/send-otp', (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).send('Email is required');

  const otp = generateOtp();
  otps[email] = otp;
  console.log(`Generated OTP: ${otp}`);

  const mailOptions = {
    from: process.env.EMAIL_USER, // Usa la variable de entorno para el correo de envío
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) return res.status(500).send('Error sending email');
    res.status(200).send({ otp });
  });
});

// Ruta para verificar OTP
app.post('/api/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) return res.status(400).send('Email and OTP are required');

  if (otps[email] && otps[email] === otp) {
    delete otps[email];
    return res.status(200).send('OTP verified successfully');
  }

  return res.status(400).send('Invalid OTP');
});

// Escuchar en el puerto correcto proporcionado por Render
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;


