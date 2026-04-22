import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY manquante. Configurez-la dans .env");
  return new Resend(key);
}

interface SendSurveyEmailParams {
  to: string;
  firstName: string;
  subject: string;
  body: string;
  surveyUrl: string;
  senderName: string;
  senderEmail: string;
}

export async function sendSurveyEmail({
  to,
  firstName,
  subject,
  body,
  surveyUrl,
  senderName,
  senderEmail,
}: SendSurveyEmailParams) {
  const personalizedBody = body.replace(/\{prénom\}/g, firstName);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="padding:24px 32px;border-bottom:1px solid #f0f0f0;">
        <div style="display:flex;align-items:center;gap:10px;">
          <div style="width:36px;height:36px;border-radius:8px;background:#18181b;color:white;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;">N</div>
          <span style="font-weight:600;font-size:15px;color:#18181b;">Novadev</span>
        </div>
      </div>
      <!-- Body -->
      <div style="padding:32px;">
        <div style="white-space:pre-line;font-size:14px;line-height:1.6;color:#6b7280;">${personalizedBody}</div>
        <div style="margin-top:28px;text-align:center;">
          <a href="${surveyUrl}" style="display:inline-block;background:#18181b;color:white;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:14px;">
            Donner mon avis
          </a>
        </div>
      </div>
      <!-- Footer -->
      <div style="padding:16px 32px;border-top:1px solid #f0f0f0;text-align:center;">
        <p style="margin:0;font-size:11px;color:#9ca3af;">Centre Novadev — 15 rue Beudant, 75017 Paris</p>
      </div>
    </div>
  </div>
</body>
</html>`;

  const resend = getResend();
  const result = await resend.emails.send({
    from: `${senderName} <${senderEmail}>`,
    to,
    subject,
    html,
  });

  return result;
}
