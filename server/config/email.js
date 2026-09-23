import nodemailer from "nodemailer";

const smtpHost = process.env.EMAIL_HOST || process.env.SMTP_HOST || process.env.MAIL_HOST || "";
const smtpPort = Number(process.env.EMAIL_PORT || process.env.SMTP_PORT || process.env.MAIL_PORT || 587);
const smtpUser = process.env.EMAIL_USER || process.env.SMTP_USER || process.env.MAIL_USERNAME || "";
const smtpPassword = process.env.EMAIL_PASSWORD || process.env.SMTP_PASSWORD || process.env.MAIL_PASSWORD || "";
const smtpFrom = process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_FROM || process.env.MAIL_FROM_ADDRESS || smtpUser;
const secure = String(process.env.EMAIL_SECURE || process.env.MAIL_SECURE || "").toLowerCase() === "true" || smtpPort === 465;

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure,
  auth: smtpUser ? { user: smtpUser, pass: smtpPassword } : undefined,
});

export const verifyEmailConnection = async () => {
  if (!smtpHost) return;
  await transporter.verify();
};

export default transporter;
