import { transporter } from "../config/nodemailer.js";
import { env } from "../validators/env.validator.js";

export const sendMail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("Error while sending mail:", error);
    throw error;
  }
};
