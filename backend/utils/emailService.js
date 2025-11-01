import nodemailer from "nodemailer";

async function sendViaResend(from, to, subject, text, html) {
  // Try SDK first (if installed)
  try {
    const mod = await import('resend').catch(() => ({}));
    const Resend = mod?.Resend;
    if (Resend) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const resp = await resend.emails.send({
        from,
        to: [to],
        subject,
        text,
        html: html || (text ? `<p>${text}</p>` : undefined),
      });
      if (resp?.error) throw new Error(resp.error.message || 'Resend API error');
      return { ok: true, provider: 'resend-sdk', id: resp?.data?.id };
    }
  } catch (e) {
    // Fall through to HTTP attempt
  }

  // Raw HTTP fallback for Resend API
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        text,
        html: html || (text ? `<p>${text}</p>` : undefined),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = data?.error?.message || `Resend HTTP error: ${res.status}`;
      const error = new Error(msg);
      error.status = res.status;
      throw error;
    }
    return { ok: true, provider: 'resend-http', id: data?.id };
  } catch (e) {
    return { ok: false, error: e, status: e?.status };
  }
}

export async function sendEmail({ to, subject, text, html, from }) {
  const senderBase = from || process.env.EMAIL_FROM || `No Reply <no-reply@${process.env.SENDER_DOMAIN || 'example.com'}>`;

  // 1) Prefer Resend HTTP API in production (avoids SMTP timeout on some hosts)
  if (process.env.RESEND_API_KEY) {
    const firstAttempt = await sendViaResend(senderBase, to, subject, text, html);
    if (firstAttempt.ok) return firstAttempt;

    // If sender domain is not verified, Resend returns 403. Retry with onboarding sender.
    const isOnboarding = /onboarding@resend\.dev/i.test(senderBase);
    if (firstAttempt.status === 403 && !isOnboarding) {
      const fallbackFrom = `Support <onboarding@resend.dev>`;
      const secondAttempt = await sendViaResend(fallbackFrom, to, subject, text, html);
      if (secondAttempt.ok) return secondAttempt;
      console.error('Resend email error (fallback failed):', secondAttempt.error || firstAttempt.error || 'unknown');
    } else if (firstAttempt.error) {
      console.error('Resend email error:', firstAttempt.error);
    }
  }

  // 2) Fallback to SMTP via Nodemailer (may fail on some platforms)
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
        from: senderBase,
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
