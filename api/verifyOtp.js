let otps = {}; // Almacenar OTPs generados temporalmente en un objeto

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  if (otps[email] && otps[email] === otp) {
    delete otps[email]; // Eliminar OTP después de la verificación
    return res.status(200).json({ message: 'OTP verified successfully' });
  } else {
    return res.status(400).json({ error: 'Invalid OTP' });
  }
}
