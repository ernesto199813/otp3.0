const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000; // Corrección aquí

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  
    pass: process.env.EMAIL_PASS 
  }
});

let otps = {}; // Almacenar OTPs generados temporalmente en un objeto

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const getOtpHtmlTemplate = (otp) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OTP Verification</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              text-align: center;
              padding: 20px;
          }
          .container {
              background-color: #ffffff;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
              max-width: 500px;
              margin: auto;
          }
          h1 {
              color: #333;
          }
          .otp {
              font-size: 24px;
              font-weight: bold;
              color: #ffffff;
              background-color: #470181;
              padding: 10px;
              display: inline-block;
              border-radius: 5px;
              letter-spacing: 2px;
          }
          p {
              font-size: 16px;
              color: #555;
          }
          .footer {
              margin-top: 20px;
              font-size: 14px;
              color: #888;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <h1>🔐 Codigo de seguridad OTP 🔐</h1>
          <p>Hola,Gracias por iniciar sesion. Para completar tu verificación, usa el siguiente código:</p>
          <div class="otp">${otp}</div>
          <p>Este código es válido por 10 minutos. No lo compartas con nadie.</p>
          <p>Si no solicitaste este código, ignora este mensaje.</p>
          <div class="footer">© 2025 Intranet Ces. Todos los derechos reservados.</div>
      </div>
  </body>
  </html>`;
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
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    html: getOtpHtmlTemplate(otp)
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).send('OTP sent successfully');
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
    res.status(200).send('OTP verified successfully');
  } else {
    res.status(400).send('Invalid OTP');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // Corrección aquí
});



