import nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const t = getTransporter();
    await t.sendMail({
      from: `"EarnCoin" <${process.env.EMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

// ─── Email Templates ────────────────────────────────────────────────

function wrapTemplate(title: string, body: string): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f7;font-family:Arial,Helvetica,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#FF8C00,#FF6B00);padding:32px 40px;text-align:center;">
                <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:bold;">🪙 EarnCoin</h1>
              </td>
            </tr>
            <!-- Body -->
            <tr>
              <td style="padding:40px;">
                ${body}
              </td>
            </tr>
            <!-- Footer -->
            <tr>
              <td style="background:#f8f9fa;padding:24px 40px;text-align:center;border-top:1px solid #e9ecef;">
                <p style="margin:0;color:#868e96;font-size:12px;">© ${new Date().getFullYear()} EarnCoin. All rights reserved.</p>
                <p style="margin:8px 0 0;color:#868e96;font-size:12px;">This is an automated email. Please do not reply.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

export function otpEmailTemplate(name: string, otp: string): string {
  return wrapTemplate("Verify Your Email", `
    <h2 style="margin:0 0 16px;color:#212529;font-size:22px;">Verify Your Email Address</h2>
    <p style="margin:0 0 24px;color:#495057;font-size:15px;line-height:1.6;">
      Hi <strong>${name}</strong>,<br><br>
      Welcome to EarnCoin! Use the verification code below to confirm your email address:
    </p>
    <div style="text-align:center;margin:32px 0;">
      <div style="display:inline-block;background:#FFF3E0;border:2px dashed #FF8C00;border-radius:12px;padding:20px 40px;">
        <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#FF6B00;">${otp}</span>
      </div>
    </div>
    <p style="margin:0 0 8px;color:#868e96;font-size:13px;text-align:center;">This code expires in <strong>10 minutes</strong>.</p>
    <p style="margin:24px 0 0;color:#495057;font-size:14px;">If you didn't create an EarnCoin account, you can safely ignore this email.</p>
  `);
}

export function passwordResetEmailTemplate(name: string, resetCode: string): string {
  return wrapTemplate("Reset Your Password", `
    <h2 style="margin:0 0 16px;color:#212529;font-size:22px;">Reset Your Password</h2>
    <p style="margin:0 0 24px;color:#495057;font-size:15px;line-height:1.6;">
      Hi <strong>${name}</strong>,<br><br>
      We received a request to reset your EarnCoin password. Use the code below:
    </p>
    <div style="text-align:center;margin:32px 0;">
      <div style="display:inline-block;background:#E3F2FD;border:2px dashed #1976D2;border-radius:12px;padding:20px 40px;">
        <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1565C0;">${resetCode}</span>
      </div>
    </div>
    <p style="margin:0 0 8px;color:#868e96;font-size:13px;text-align:center;">This code expires in <strong>15 minutes</strong>.</p>
    <p style="margin:24px 0 0;color:#495057;font-size:14px;">If you didn't request a password reset, your account is safe — just ignore this email.</p>
  `);
}

export function welcomeEmailTemplate(name: string, bonusPoints: number): string {
  return wrapTemplate("Welcome to EarnCoin!", `
    <h2 style="margin:0 0 16px;color:#212529;font-size:22px;">Welcome to EarnCoin! 🎉</h2>
    <p style="margin:0 0 24px;color:#495057;font-size:15px;line-height:1.6;">
      Hi <strong>${name}</strong>,<br><br>
      Your email has been verified and your account is now active! You've been credited <strong>${bonusPoints} welcome bonus points</strong>.
    </p>
    <div style="text-align:center;margin:32px 0;">
      <div style="display:inline-block;background:#E8F5E9;border-radius:12px;padding:20px 40px;">
        <span style="font-size:28px;font-weight:bold;color:#2E7D32;">+${bonusPoints} Points</span>
      </div>
    </div>
    <p style="margin:0;color:#495057;font-size:14px;">Start earning by watching videos, completing tasks, and referring friends. Happy earning! 🚀</p>
  `);
}

export function passwordChangedEmailTemplate(name: string): string {
  return wrapTemplate("Password Changed", `
    <h2 style="margin:0 0 16px;color:#212529;font-size:22px;">Password Changed Successfully</h2>
    <p style="margin:0 0 24px;color:#495057;font-size:15px;line-height:1.6;">
      Hi <strong>${name}</strong>,<br><br>
      Your EarnCoin password has been changed successfully. You can now log in with your new password.
    </p>
    <p style="margin:24px 0 0;color:#dc3545;font-size:14px;"><strong>If you didn't make this change</strong>, please contact our support team immediately.</p>
  `);
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
