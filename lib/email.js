import nodemailer from "nodemailer";

export async function sendResetEmail(to, resetUrl) {
  if (!process.env.EMAIL_HOST) {
    // Dev fallback: log to console instead of sending
    console.log("[Password Reset] link for", to, "→", resetUrl);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT ?? "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });

  await transporter.sendMail({
    from: `"Mandalay Land" <${process.env.EMAIL_FROM ?? process.env.EMAIL_USER}>`,
    to,
    subject: "Password Reset · မန်းလေး မြေကွက်",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;background:#13151A;color:#ECE6D9;padding:32px;border-radius:16px;">
        <h2 style="color:#E0A33B;margin:0 0 12px;">Password ပြန်သတ်မှတ်ရန်</h2>
        <p style="color:#9CA3AF;margin:0 0 24px;">ဒီ link ကို နှိပ်ပြီး Password သစ် သတ်မှတ်ပါ။ Link သည် ၁ နာရီ အတွင်း သက်တမ်းကုန်ဆုံးမည်။</p>
        <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;background:#E0A33B;color:#1A1206;border-radius:10px;text-decoration:none;font-weight:700;">
          Password ပြန်သတ်မှတ်မည်
        </a>
        <p style="color:#6B7280;font-size:12px;margin-top:24px;">
          ဤ Email ကို မတောင်းဆိုထားလျှင် လျစ်လျူရှုနိုင်သည်။
        </p>
      </div>
    `,
  });
}
