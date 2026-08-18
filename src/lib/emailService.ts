import nodemailer from "nodemailer";

// Gmail SMTP transporter — uses app password from .env
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    await transporter.sendMail({
      from: `"EarnCoin" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Email send error:", error);
    return false;
  }
}

export function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function otpEmailTemplate(name: string, code: string): { subject: string; html: string } {
  return {
    subject: `OTP: ${code}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0B0F19;color:#F0F0F0;padding:32px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#FF8C00;margin:0;font-size:28px;">EarnCoin</h1>
        </div>
        <h2 style="color:#FF8C00;">Verify your email</h2>
        <p>Hi ${name}, use the code below to verify your email address:</p>
        <div style="text-align:center;margin:24px 0;">
          <div style="display:inline-block;background:#1A1D24;border:2px solid #FF8C00;border-radius:8px;padding:16px 32px;font-size:32px;font-weight:bold;letter-spacing:8px;color:#FF8C00;">${code}</div>
        </div>
        <p style="color:#BDBDBD;">This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
        <p style="color:#666;font-size:12px;margin-top:32px;border-top:1px solid #222;padding-top:16px;">© ${new Date().getFullYear()} EarnCoin. All rights reserved.</p>
      </div>
    `,
  };
}

export function welcomeEmailTemplate(name: string): { subject: string; html: string } {
  return {
    subject: "Welcome to EarnCoin — 150 bonus points credited!",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0B0F19;color:#F0F0F0;padding:32px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#FF8C00;margin:0;font-size:28px;">EarnCoin</h1>
        </div>
        <h2 style="color:#FF8C00;">Welcome aboard, ${name}! 🎉</h2>
        <p>Your account is verified and <strong>150 welcome bonus points</strong> have been credited to your balance.</p>
        <p>You can now start earning by watching videos, completing tasks, joining events, and inviting friends.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}" style="display:inline-block;background:#FF8C00;color:#0B0F19;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin-top:16px;">Start Earning</a>
        <p style="color:#666;font-size:12px;margin-top:32px;border-top:1px solid #222;padding-top:16px;">© ${new Date().getFullYear()} EarnCoin. All rights reserved.</p>
      </div>
    `,
  };
}

export function withdrawalEmailTemplate(name: string, amount: string, method: string, status: string): { subject: string; html: string } {
  return {
    subject: `Withdrawal ${status} — ${amount}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0B0F19;color:#F0F0F0;padding:32px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#FF8C00;margin:0;font-size:28px;">EarnCoin</h1>
        </div>
        <h2 style="color:#FF8C00;">Withdrawal Update</h2>
        <p>Hi ${name},</p>
        <div style="background:#1A1D24;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="margin:4px 0;"><strong>Amount:</strong> ${amount}</p>
          <p style="margin:4px 0;"><strong>Method:</strong> ${method}</p>
          <p style="margin:4px 0;"><strong>Status:</strong> <span style="color:#FF8C00;text-transform:capitalize;">${status}</span></p>
        </div>
        <p style="color:#BDBDBD;">Processing time is typically 24-72 hours.</p>
        <p style="color:#666;font-size:12px;margin-top:32px;border-top:1px solid #222;padding-top:16px;">© ${new Date().getFullYear()} EarnCoin. All rights reserved.</p>
      </div>
    `,
  };
}

export function passwordResetEmailTemplate(name: string, resetCode: string): { subject: string; html: string } {
  return {
    subject: `Password Reset Code: ${resetCode}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;background:#0B0F19;color:#F0F0F0;padding:32px;border-radius:12px;">
        <div style="text-align:center;margin-bottom:24px;">
          <h1 style="color:#FF8C00;margin:0;font-size:28px;">EarnCoin</h1>
        </div>
        <h2 style="color:#FF8C00;">Reset your password</h2>
        <p>Hi ${name}, you requested a password reset. Use the code below:</p>
        <div style="text-align:center;margin:24px 0;">
          <div style="display:inline-block;background:#1A1D24;border:2px solid #FF8C00;border-radius:8px;padding:16px 32px;font-size:32px;font-weight:bold;letter-spacing:8px;color:#FF8C00;">${resetCode}</div>
        </div>
        <p style="color:#BDBDBD;">This code expires in 15 minutes. If you didn't request this, you can safely ignore this email — your password will remain unchanged.</p>
        <p style="color:#666;font-size:12px;margin-top:32px;border-top:1px solid #222;padding-top:16px;">© ${new Date().getFullYear()} EarnCoin. All rights reserved.</p>
      </div>
    `,
  };
}

