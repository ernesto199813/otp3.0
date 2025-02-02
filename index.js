const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// Configuración del transporte de Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'intranetd6@gmail.com',
    pass: 'bicd dpvg gcwy ihyc' // Usa una contraseña de aplicación para mayor seguridad
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

  const otp = generateOtp();
  otps[email] = otp;
  console.log(`Generated OTP: ${otp}`);

  const mailOptions = {
    from: 'intranetd6@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).send('Error sending email');
    } else {
      console.log('Email sent: ' + info.response);
      return res.status(200).send({ otp });
    }
  });
});

// Ruta para verificar OTP
app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).send('Email and OTP are required');
  }

  if (otps[email] && otps[email] === otp) {
    delete otps[email]; // Eliminar OTP después de la verificación
    return res.status(200).send('OTP verified successfully');
  } else {
    return res.status(400).send('Invalid OTP');
  }
});

// Exporta la aplicación para que Vercel la maneje como función serverless
module.exports = app;
