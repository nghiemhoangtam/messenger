import * as nodemailer from 'nodemailer';

export const sendSimpleMail = async (
  to: string,
  subject: string,
  html: string,
) => {
  const transporter = nodemailer.createTransport({
    service: 'Gmail', // or SMTP config
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    to,
    subject,
    html,
  });
};
