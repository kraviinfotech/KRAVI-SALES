const nodemailer = require('nodemailer');
const Settings = require('../models/Settings');

const getSmtpSettings = async () => {
  const settings = await Settings.findOne().lean();
  const host = process.env.SMTP_HOST || settings?.smtpHost;
  const port = Number(process.env.SMTP_PORT || settings?.smtpPort);
  const user = process.env.SMTP_USER || settings?.smtpUser;
  const pass = process.env.SMTP_PASS || settings?.smtpPass;
  const from = process.env.EMAIL_FROM || `no-reply@${process.env.APP_DOMAIN || 'kravi-sales.com'}`;

  if (!host || !port || !user || !pass) {
    return null;
  }

  return { host, port, user, pass, from };
};

const createTransporter = async () => {
  const settings = await getSmtpSettings();
  if (!settings) return null;

  return nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.port === 465,
    auth: {
      user: settings.user,
      pass: settings.pass
    }
  });
};

const sendEmail = async ({ to, subject, text, html, from }) => {
  const settings = await getSmtpSettings();
  if (!settings) {
    throw new Error(`SMTP is not configured. Email not sent to: ${to}`);
  }

  const transporter = await createTransporter();
  if (!transporter) {
    throw new Error(`Unable to create SMTP transporter. Email not sent to: ${to}`);
  }

  const mailOptions = {
    from: from || settings.from,
    to,
    subject,
    text,
    html
  };

  return transporter.sendMail(mailOptions);
};

const buildWelcomeEmail = (user) => {
  const appName = process.env.APP_NAME || 'KRAVI SALES';
  const subject = `Welcome to ${appName}!`;
  const text = `Hello ${user.name || 'User'},

Welcome to ${appName}. Your manager account has been created successfully.

You can now login with your email and password, or use Google sign-in if available.

If you need help, reply to this email or contact support.

Best regards,
The ${appName} Team`;
  const html = `<p>Hello ${user.name || 'User'},</p>
<p>Welcome to <strong>${appName}</strong>. Your manager account has been created successfully.</p>
<p>You can now login with your email and password, or use Google sign-in if available.</p>
<p>If you need help, reply to this email or contact support.</p>
<p>Best regards,<br/>The ${appName} Team</p>`;

  return { subject, text, html };
};

const buildOtpEmail = ({ name, email, otp }) => {
  const appName = process.env.APP_NAME || 'KRAVI SALES';
  const supportEmail = process.env.SUPPORT_EMAIL || 'support@kravi-sales.com';
  const subject = `Your ${appName} verification code`;
  const text = `Hello ${name || 'User'},

Your verification code is ${otp}. This code will expire in 10 minutes.

If you did not request this code, please ignore this message or contact our support team at ${supportEmail}.

Thank you,
The ${appName} Team`;
  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;line-height:1.6;">
      <p>Hello ${name || 'User'},</p>
      <p>Your verification code is:</p>
      <p style="font-size:28px;font-weight:700;margin:20px 0;padding:16px 20px;border-radius:12px;background:#f3f4f6;display:inline-block;letter-spacing:0.2em;">${otp}</p>
      <p>This code will expire in <strong>10 minutes</strong>.</p>
      <p>If you did not request this verification code, please ignore this message or contact our support team at <a href="mailto:${supportEmail}" style="color:#2563eb;text-decoration:none;">${supportEmail}</a>.</p>
      <p>Thank you,<br/>The ${appName} Team</p>
    </div>
  `;
  return { subject, text, html };
};

const buildSubscriptionEmail = ({ user, plan, subscription, payment }) => {
  const appName = process.env.APP_NAME || 'KRAVI SALES';
  const endDate = subscription?.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A';
  const subject = `Your ${plan?.name || 'subscription'} is now active`;
  const text = `Hello ${user.name || 'User'},

Thank you for your payment of ${(payment?.currency || 'INR')} ${payment?.amount || 0}.
Your ${plan?.name || 'subscription'} is now active and will remain valid through ${endDate}.

Plan details:
- Plan: ${plan?.name || 'N/A'}
- Amount: ${(payment?.currency || 'INR')} ${payment?.amount || 0}
- Expires: ${endDate}

If you have any questions, contact support.

Best regards,
The ${appName} Team`;
  const html = `<p>Hello ${user.name || 'User'},</p>
<p>Thank you for your payment of <strong>${(payment?.currency || 'INR')} ${payment?.amount || 0}</strong>.</p>
<p>Your <strong>${plan?.name || 'subscription'}</strong> is now active and valid through <strong>${endDate}</strong>.</p>
<p><strong>Plan details</strong><br/>Plan: ${plan?.name || 'N/A'}<br/>Amount: ${(payment?.currency || 'INR')} ${payment?.amount || 0}<br/>Expires: ${endDate}</p>
<p>If you have any questions, contact support.</p>
<p>Best regards,<br/>The ${appName} Team</p>`;

  return { subject, text, html };
};

module.exports = {
  sendEmail,
  buildWelcomeEmail,
  buildOtpEmail,
  buildSubscriptionEmail
};
