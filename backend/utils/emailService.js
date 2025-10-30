import nodemailer from "nodemailer";
import { Resend } from "resend";

export async function sendEmail({ to, subject, text, html, from }) {
  // Prefer Resend HTTP API in production
  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const resp = await resend.emails.send({
        from: from || process.env.EMAIL_FROM || `No Reply <no-reply@${process.env.SENDER_DOMAIN || 'example.com'}>`,
        to: [to],
        subject,
        text,
        html: html || (text ? `<p>${text}</p>` : undefined),
      });
      if (resp?.error) throw new Error(resp.error.message || 'Resend API error');
      return { ok: true, provider: 'resend', id: resp?.data?.id };
    } catch (e) {
      console.error('Resend email error:', e);
    }
  } else {
    console.warn('RESEND_API_KEY not set. Falling back to SMTP if configured.');
  }

  // Fallback to SMTP via Nodemailer (may fail on some platforms)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    try {
      const hasHost = !!process.env.EMAIL_HOST;
      const transporter = nodemailer.createTransport({
        host: hasHost ? process.env.EMAIL_HOST : undefined,
        port: hasHost && process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : undefined,
        secure: (process.env.EMAIL_SECURE || '').toLowerCase() === 'true',
        service: hasHost ? undefined : (process.env.EMAIL_SERVICE || 'Gmail'),
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
      });

      await transporter.sendMail({
        from: from || process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
      });
      return { ok: true, provider: 'smtp' };
    } catch (e) {
      console.error('SMTP email error:', e);
    }
  }

  return { ok: false };
}
