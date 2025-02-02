const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

let otps = {}; // Almacenar OTPs generados temporalmente en un objeto

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const otp = generateOtp();
  otps[email] = otp;
  console.log(`Generated OTP: ${otp}`);

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is: ${otp}`
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.status(200).json({ otp });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Error sending email' });
  }
}
