require('dotenv').config(); // Cargar las variables de entorno

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Usar la variable de entorno
    pass: process.env.EMAIL_PASS  // Usar la variable de entorno
  }
});

let otps = {};

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

app.post('/send-otp', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).send('Email is required');
  }

  const otp = generateOtp();
  otps[email] = otp;
  console.log(`Generated OTP: ${otp}`);

  const mailOptions = {
    from: process.env.EMAIL_USER, // Usar la variable de entorno
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
      res.status(200).send({ otp });
    }
  });
});

app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).send('Email and OTP are required');
  }

  if (otps[email] && otps[email] === otp) {
    delete otps[email];
    res.status(200).send('OTP verified successfully');
  } else {
    res.status(400).send('Invalid OTP');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


