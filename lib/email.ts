import nodemailer from "nodemailer";

function buildEmailHtml(verificationUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="color: #2563eb;">Verifikasi akun Anda</h2>
      <p>Terima kasih telah mendaftar di NewsPortal.</p>
      <p>Klik tombol di bawah ini untuk mengaktifkan akun Anda:</p>
      <p>
        <a href="${verificationUrl}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
          Verifikasi Email
        </a>
      </p>
      <p>Jika tombol tidak bekerja, salin tautan berikut ke browser:</p>
      <p>${verificationUrl}</p>
      <p>Jika Anda tidak mendaftar, abaikan email ini.</p>
    </div>
  `;
}

async function sendWithSmtp(email: string, verificationUrl: string) {
  const host = process.env.EMAIL_SERVER_HOST?.trim();
  const port = Number.parseInt(process.env.EMAIL_SERVER_PORT || "", 10);
  const user = process.env.EMAIL_SERVER_USER?.trim();
  const pass = process.env.EMAIL_SERVER_PASSWORD?.trim();

  if (!host || !port || !user || !pass) {
    return { success: false, message: "Konfigurasi SMTP belum lengkap" };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || user,
    to: email,
    subject: "Verifikasi akun NewsPortal",
    html: buildEmailHtml(verificationUrl),
  });

  return {
    success: true,
    message: "Email berhasil dikirim via SMTP",
  };
}

export async function sendVerificationEmail(
  email: string,
  verificationUrl: string,
) {
  try {
    const smtpResult = await sendWithSmtp(email, verificationUrl);
    if (smtpResult.success) {
      return smtpResult;
    }

    return {
      success: false,
      message: smtpResult.message,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Gagal mengirim email melalui SMTP",
    };
  }
}
