// routes/emailRoute.js
import express from 'express';
import axios from 'axios';

const router = express.Router();

// POST /api/send-email
router.post('/', async (req, res) => {
  try {
    const { toEmail, toName, subject, htmlContent } = req.body;

    if (!toEmail || !subject || !htmlContent) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: process.env.EMAIL_SENDER_NAME,
          email: process.env.EMAIL_SENDER,
        },
        to: [{ email: toEmail, name: toName || '' }],
        subject,
        htmlContent,
      },
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.response?.data || error.message });
  }
});

export default router;
